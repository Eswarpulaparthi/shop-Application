const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Products" },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

UserSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

UserSchema.methods.deleteCartItem = function (prodId) {
  let updatedCart = [...this.cart.items];
  const idx = this.cart.items.findIndex((i) => {
    return i.productId.toString() === prodId.toString();
  });
  let newQuantity;
  if (idx >= 0) {
    newQuantity = updatedCart[idx].quantity - 1;
  }
  if (newQuantity <= 0) {
    const new_updatedCart = updatedCart.filter((i) => {
      return i.productId.toString() !== prodId.toString();
    });
    updatedCart = new_updatedCart;
  } else {
    updatedCart[idx].quantity = newQuantity;
  }
  const update = {
    items: updatedCart,
  };
  this.cart = update;

  return this.save();
};

UserSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model("Users", UserSchema);
