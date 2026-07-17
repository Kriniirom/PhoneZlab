export interface FaqItem {
  id: string;
  category: "Shipping" | "Payments" | "Orders" | "Returns" | "Warranty" | "Products" | "Customer Account" | "Contact";
  question: string;
  answer: string;
}

export const faqData: FaqItem[] = [
  // Shipping
  {
    id: "delivery-time",
    category: "Shipping",
    question: "How long does delivery take?",
    answer: "Orders are usually delivered within 2–5 business days, depending on your location."
  },
  {
    id: "shipping-cost",
    category: "Shipping",
    question: "What are the shipping charges?",
    answer: "We offer free standard shipping on all orders over ₹999. For orders below this amount, a flat rate of ₹99 is charged at checkout."
  },
  {
    id: "shipping-cost",
    category: "Shipping",
    question: "How to track my order?",
    answer: "We offer free standard shipping on all orders over ₹999. For orders below this amount, a flat rate of ₹99 is charged at checkout."
  },
  // Payments
  {
    id: "payment-methods",
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, Net Banking, and popular mobile wallets."
  },
  {
    id: "cash-on-delivery",
    category: "Payments",
    question: "Do you offer Cash on Delivery?",
    answer: "Yes, Cash on Delivery is available in selected locations. You can check COD availability by entering your PIN code at checkout."
  },
  // Orders
  {
    id: "track-order",
    category: "Orders",
    question: "How can I track my order?",
    answer: "Once your order has shipped, you will receive a tracking link via email and SMS to monitor its transit in real time."
  },
  {
    id: "cancel-order",
    category: "Orders",
    question: "Can I cancel or modify my order?",
    answer: "Orders can be cancelled or modified within 1 hour of placement. Please contact customer support immediately to request changes."
  },
  // Returns
  {
    id: "return-product",
    category: "Returns",
    question: "Can I return my product?",
    answer: "Eligible products can be returned within 14 days of delivery according to our Return Policy. The product must be unused, in its original packaging, and with all tags intact."
  },
  {
    id: "refund-time",
    category: "Returns",
    question: "When will I receive my refund?",
    answer: "Refunds are processed within 5-7 business days after the returned item passes quality check at our warehouse, credited back to your original payment method."
  },
  // Warranty
  {
    id: "warranty-period",
    category: "Warranty",
    question: "Do your products come with a warranty?",
    answer: "Yes, all premium cases and chargers come with a 6-month limited manufacturer warranty covering manufacturing defects."
  },
  // Products
  {
    id: "product-compatibility",
    category: "Products",
    question: "Are your cases compatible with wireless charging?",
    answer: "Most of our MagSafe and premium cases are fully compatible with Qi-certified and MagSafe wireless chargers. Product listings specify wireless charging compatibility."
  },
  // Customer Account
  {
    id: "account-benefits",
    category: "Customer Account",
    question: "Why should I create an account?",
    answer: "An account allows you to track order history, save addresses for faster checkout, and gain early access to sales and new arrivals."
  },
  // Contact
  {
    id: "support-hours",
    category: "Contact",
    question: "What are your customer support hours?",
    answer: "Our support team is available Monday through Saturday from 9 AM to 6 PM IST. You can reach out via email at support@phonezlab.com."
  }
];
