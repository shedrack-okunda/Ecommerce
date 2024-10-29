import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  productId: {
    type: String,
    default: "",
  },
  isOrdered: {
    type: Boolean,
    default: false,
  },
  isBought: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
