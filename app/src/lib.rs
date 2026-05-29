#![no_std]
use sails_rs::prelude::*;

pub mod services;
use services::promoter::PromoterService;

pub struct PromoterProgram;

#[sails_rs::program]
impl PromoterProgram {
    pub fn new(operator: ActorId) -> Self {
        PromoterService::init(operator);
        Self
    }

    pub fn promoter(&self) -> PromoterService {
        PromoterService::new()
    }
}
