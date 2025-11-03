---
title: "IDC Connect Me"
date: 2025-11-03T16:21:06+11:00
draft: false
---

I've spend the last few days getting annoyed at all the public WiFi hotspots
that I have to log into with a captive portal. So I wrote a little app to do it
for you.

<!--more-->

It's called [idc-connectme](https://github.com/hectorBrown/idc-connectme) and
it uses a headless chromium browser to log you in without you lifting a finger.

It's not very good yet, but it works on Sydney City library WiFi. I'm going to
try and get it working on my hostel WiFi next. Testing can be quite difficult as
it can be [hard work getting these hotspots to forget
you](/blog/reauth-public).

{{< toc >}}

## I thought I said IDC

The logic at the moment is very basic, it just looks for an `<input>` element in
the HTML with `type="submit"`, and clicks it. Obviously that will break as soon
as there is a "Confirm you have read...", or a "Input your email address...". My
loose plan is to have it check every checkbox on the page, and smart-fill any
text boxes with fake email addresses or phone numbers depending on what it
believes the input to be for. I think that should be enough to cover ~80% of
hotspots, which would be a pretty good result. Where it fails, it only opens the
captive portal for you anyway, so you don't really lose anything from running it
(maybe a bit of time).

When used with a `NetworkManager` dispatcher script, it can log you in
automatically as soon as you connect to a captive portal hotspot. This one is
modified from [captive-portal.sh](https://github.com/Seme4eg/captive-portal-sh).

```shell
#!/bin/sh -e
#
# Connects on walled garden networks.

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

if [ -x "/usr/bin/logger" ]; then
  logger="/usr/bin/logger -s -t captive-portal"
else
  logger=":"
fi

open_captive() {
  captive_url=http://$(ip --oneline route get 1.1.1.1 | awk '{print $3}')
  sudo -u "$1" DISPLAY=":0" \
    DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/"$(id -u "$1")"/bus \
    /home/hex/.cargo/bin/idc-connectme -u "$1" "${captive_url}"
}

case "$2" in
  connectivity-change)
    $logger -p user.debug \
      "dispatcher script triggered on connectivity change: $CONNECTIVITY_STATE"

    if [ "$CONNECTIVITY_STATE" = "PORTAL" ]; then
      user=$(who | head -n1 | cut -d' ' -f 1)
      while [ -z $user ]; do
       user=$(who | head -n1 | cut -d' ' -f 1)
       sleep 0.5
      done

      $logger "Running browser as '$user' to login in captive portal"

      open_captive "$user" || $logger -p user.err "Failed for user: '$user'"
    fi
    ;;
  *) exit 0 ;;
esac

```

Every time there is a change in connectivity state, it checks if it is inside a
portal, and if it is, detects the relevant URL and runs the program as the
logged in user.

## The meat

This is the meat of it

```rust
async fn autoconnect_withdriver(captive_url: &str, webdriver_address: &str) -> Result<()> {
    let client = ClientBuilder::native()
        .capabilities(
            json!({
                "goog:chromeOptions": {
                    "args": ["--headless=new", "--no-sandbox", "--disable-gpu"]
                }
            })
            .as_object()
            .ok_or(anyhow!("Failed to create capabilities"))?
            .clone(),
        )
        .connect(webdriver_address)
        .await
        .map_err(|e| anyhow!("Failed to create client: {}", e))?;

    client.goto(captive_url).await.map_err(|e| {
        anyhow!(
            "Failed to navigate to captive portal URL {}: {}",
            captive_url,
            e
        )
    })?;
    client.wait().for_element(Locator::Css("body")).await?;

    println!("Navigated to captive portal URL {}", captive_url);

    for selector in SUBMIT_SELECTORS {
        println!("Trying selector {}", selector);
        if let Ok(element) = client.find(Locator::Css(selector)).await {
            println!("Found element {}", element.html(false).await?);
            element.click().await.map_err(|e| {
                anyhow!("Failed to click element with selector {}: {}", selector, e)
            })?;
            println!("Clicked element with selector {}", selector);
            break;
        }
    }

    for _ in 0..(CONNECTIVITY_TIMEOUT / CONNECTIVITY_REFRESH) {
        if check_connected().await? {
            return Ok(());
        }
        sleep(Duration::from_millis(500)).await;
    }
    Err(anyhow!("Not connected to internet."))
}
```

There were a couple of things that caught me out while writing this:

1. ```rust
   // ...
   client.wait().for_element(Locator::Css("body")).await?;
   // ...
   ```

   This line is actually very important, since pages like this are often
   dynamically loaded with JavaScript. If you grab the source right after
   navigating to the page, you get nothing but header HTML.

2. ```rust
       let client = ClientBuilder::native()
           .capabilities(
               json!({
                   "goog:chromeOptions": {
                       "args": ["--headless=new", "--no-sandbox", "--disable-gpu"]
                   }
               })
               .as_object()
               .ok_or(anyhow!("Failed to create capabilities"))?
               .clone(),
           )
      // ...
   ```

   If you don't build a `fantoccini` client with the capabilities to run
   headless, it will connect to your headless `chromedriver` instance, but open
   an actual window anyway.

I also realised at some point it was very important to kill `chromedriver` once
we were done with it, no matter what happened. Otherwise the user ends up with
dozens of orphaned `chromedriver` processes running in the background.

```rust
async fn autoconnect(captive_url: &str) -> Result<()> {
    let mut webdriver_process = start_webdriver()?;
    let res = {
        let port = get_webdriver_port(&mut webdriver_process).await?;
        println!("Started WebDriver on port {}", port);
        autoconnect_withdriver(captive_url, format!("http://localhost:{}", port).as_str()).await
    };

    webdriver_process.kill().await?;
    webdriver_process.wait().await?;

    res
}
```

So we capture the result of the rest of the processing in `res`, then kill the
child process regardless, before returning the result.

Finally, my notification logic is super ugly:

```rust
fn notify(summary: &str, body: &str, user: Option<String>) -> Result<()> {
    if let Err(err) = Notification::new()
        .summary(summary)
        .body(body)
        .timeout(5000)
        .show()
        .map_err(|e| anyhow!("Error showing notification {}", e))
    {
        if let Some(user) = user {
            let status = std::process::Command::new("systemd-run")
                .arg("--unit=root-notify")
                .arg("--wait")
                .arg(format!("--property=User={}", user))
                .arg("/usr/bin/notify-send")
                .arg(summary)
                .arg(body)
                .status();
            return match status {
                Ok(s) if s.success() => Ok(()),
                Ok(s) => Err(anyhow!(
                    "notify-send failed with status {} after error {}",
                    s,
                    err
                )),
                Err(e) => Err(anyhow!(
                    "Failed to execute notify-send: {} after error {}",
                    e,
                    err
                )),
            };
        } else {
            return Err(anyhow!(
                "Failed to execute notify-send (no user provided) after error {}",
                err
            ));
        }
    }
    Ok(())
}
```

Doing notifications cross-platform is tough, so the base case is to use
`notify_rust` to handle it for me. The second case here is for linux users who
are running as root (like in a NetworkManager dispatcher script). In that case,
we use `systemd-run` to send a notification to the user's sesssion. Most of the
spaghetti here is just error handling.

## Already making life easier

While I've been writing this, I've watched it run in the background a couple of
times (Sydney City Library WiFi has a habit of kicking you off). I'm hoping one
day, it'll completely remove the need for me to ever touch a captive portal.
