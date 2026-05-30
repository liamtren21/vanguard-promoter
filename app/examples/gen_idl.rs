fn main() {
    sails_idl_gen::generate_idl_to_file::<vanguard_promoter::PromoterProgram>(
        "target/vanguard-promoter-091.idl",
    )
    .unwrap();
}
