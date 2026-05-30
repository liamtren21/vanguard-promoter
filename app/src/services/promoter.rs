use sails_rs::{
    gstd::msg,
    prelude::*,
    collections::HashMap,
};

#[derive(Clone, Encode, Decode, TypeInfo)]
pub struct PromotionOrder {
    pub id: u64,
    pub target_agent: ActorId,
    pub pitch_text: String,
    pub cost: u128,
    pub status: PromoStatus,
}

#[derive(Clone, Encode, Decode, TypeInfo, PartialEq, Eq)]
pub enum PromoStatus {
    Pending,
    Delivered,
}

pub struct PromoterState {
    pub orders: HashMap<u64, PromotionOrder>,
    pub order_count: u64,
    pub operator_address: ActorId,
}

static mut STATE: Option<PromoterState> = None;

pub struct PromoterService;

impl PromoterService {
    pub fn init(operator: ActorId) {
        unsafe {
            STATE = Some(PromoterState {
                orders: HashMap::new(),
                order_count: 0,
                operator_address: operator,
            });
        }
    }

    pub fn new() -> Self {
        Self
    }
}

#[sails_rs::service]
impl PromoterService {
    #[export]
    pub fn order_promotion(&mut self, target_agent: ActorId, pitch_text: String) -> u64 {
        let state = unsafe { STATE.as_mut().expect("State not initialized") };
        let payment = msg::value();
        assert!(payment >= 2_000_000_000_000, "Promotion cost is exactly 2 VARA"); // 2 VARA at 12 decimals
        
        state.order_count += 1;
        let order = PromotionOrder {
            id: state.order_count,
            target_agent,
            pitch_text,
            cost: payment,
            status: PromoStatus::Pending,
        };
        state.orders.insert(state.order_count, order);
        state.order_count
    }

    #[export]
    pub fn deliver_promotion(&mut self, order_id: u64, _proof_url: String) -> bool {
        let state = unsafe { STATE.as_mut().expect("State not initialized") };
        assert_eq!(msg::source(), state.operator_address, "Only operator can mark campaign as delivered");
        
        if let Some(order) = state.orders.get_mut(&order_id) {
            order.status = PromoStatus::Delivered;
            true
        } else {
            false
        }
    }

    #[export]
    pub fn get_active_promotions(&self) -> Vec<PromotionOrder> {
        let state = unsafe { STATE.as_ref().expect("State not initialized") };
        state.orders.values()
            .filter(|o| o.status == PromoStatus::Pending)
            .cloned()
            .collect()
    }
}
