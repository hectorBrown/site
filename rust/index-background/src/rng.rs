use rand::rngs::SmallRng;
pub fn gen_range(lb: f32, ub: f32, rng: &mut SmallRng) -> f32 {
    rand::Rng::next_u32(rng) as f32 / u32::MAX as f32 * (ub - lb) + lb
}
pub fn get_rng() -> SmallRng {
    let rng: SmallRng = rand::make_rng();
    rng
}
