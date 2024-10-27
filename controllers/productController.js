import ProductModel from "../models/Product.js";

export const createProduct = async (req, res) => {
  console.log("req.body");
  console.log(req.body);
  let { title, category, description, price, stock, image } = req.body;

  if (!title || !description || !price || !image || !stock || !category) {
    return res.status(400).json({
      Status: "Failed",
      message:
        "Title, description, image, price, category and stock are required!",
    });
  }

  try {
    const newProduct = new ProductModel({
      title,
      category,
      description,
      image,
      price,
      stock,
    });

    await newProduct.save();
    res.status(200).json({
      Status: "Success",
      message: "Product created successfully!",
      product: newProduct,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const editProduct = async (req, res) => {
  let productId = req.body.productId;
  let title = req.body.title;
  let description = req.body.description;
  let price = req.body.price;

  if (!productId) {
    return res.status(400).json({
      Status: "Failed",
      message: "Product ID is required!",
    });
  }

  if (!title && !description && !price) {
    return res.status(400).json({
      Status: "Failed",
      message:
        "At least one field (title, description, price) is required for update!",
    });
  }

  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { title, description, price, category, stock },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({
        Status: "Failed",
        message: "Product not found!",
      });
    }

    res.status(200).json({
      Status: "Success",
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const listProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({});
    res.status(200).json({
      Status: "Success",
      message: "Products retrieved successfully!",
      products: products,
    });
  } catch (error) {
    res.status(500).json({
      Status: "Failed",
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  let productId = req.body.productId;

  if (!productId) {
    return res.status(400).json({
      Status: "Failed",
      message: "Product ID is required!",
    });
  }

  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({
        Status: "Failed",
        message: "Product not found!",
      });
    }

    res.status(200).json({
      Status: "Success",
      message: "Product deleted successfully!",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
