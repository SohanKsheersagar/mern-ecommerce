export const API_URL = process.env.REACT_APP_API;

export const SOCKET_URL =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:3000'
    : window.location.host;

export const ROLES = {
  Admin: 'Admin',
  Member: 'Member',
  Merchant: 'Merchant'
};


export const CART_ITEMS = 'cart_items';
export const CART_TOTAL = 'cart_total';
export const CART_ID = 'cart_id';

export const CART_ITEM_STATUS = {
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  Not_processed: 'Not processed'
};

export const MERCHANT_STATUS = {
  Rejected: 'Rejected',
  Approved: 'Approved',
  Waiting_Approval: 'Waiting Approval'
};

export const REVIEW_STATUS = {
  Rejected: 'Rejected',
  Approved: 'Approved',
  Waiting_Approval: 'Waiting Approval'
};

export const EMAIL_PROVIDER = {
  Email: 'Email',
  Google: 'Google',
  Facebook: 'Facebook'
};
