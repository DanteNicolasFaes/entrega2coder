import fs from "node:fs";
import ProductsManager from "../class/productManager.js";
import { __dirname } from "../utils.js";

const productManager = new ProductsManager(__dirname + "/data/products.json");

class CartsManager {
  constructor(path) {
    this.path = path;
    this.cartList = [];
  }

  async getAllCarts() {
    const list = await fs.promises.readFile(this.path, "utf-8");
    this.cartList = JSON.parse(list).carts || [];
    return [...this.cartList];
  }

  async addCart() {
    const newId = await this.getNextCartId();
    const newCart = { id: newId, products: [] };
    this.cartList.push(newCart);
    await this.saveCarts();
    return newId;
  }

  async getCart(id) {
    await this.getAllCarts();
    const cart = this.cartList.find((cart) => cart.id === id);
    if (cart) {
      return cart;
    } else {
      throw new Error("ID no encontrado");
    }
  }

  async addProductToCart(cid, pid) {
   
    const productsList = await productManager.getAllProducts();
    const cartsList = await this.getAllCarts();
    
    if (productsList.some((obj) => obj.id == pid)) {
      if (cartsList.some((obj) => obj.id == cid)) {
        const prod = productsList.find((obj) => obj.id == pid);
        const cartIndex = cartsList.findIndex((obj) => obj.id == cid);
        const cart = cartsList[cartIndex];

    
        const productIndex = cart.products.findIndex((p) => p.id === pid);
        if (productIndex !== -1) {
          cart.products[productIndex].quantity++;
        } else {
          cart.products.push({ id: prod.id, quantity: 1 });
        }

        
        this.cartList[cartIndex] = cart;

        
        await this.saveCarts();

        console.log("Producto agregado al carrito");
      } else {
        console.log("No existe el ID del carrito");
      }
    } else {
      console.log("No existe el ID del producto");
    }
  }

  
  async getNextCartId() {
    await this.getAllCarts();
    const maxId = this.cartList.reduce(
      (max, cart) => (cart.id > max ? cart.id : max),
      0
    );
    return maxId + 1; 
  }
  async saveCarts() {
    try {
      await fs.promises.writeFile(
        this.path,
        JSON.stringify({ carts: this.cartList })
      );
      console.log("Carritos guardados.");
    } catch (error) {
      console.error("Error al guardar los carritos:", error);
    }
  }
}

export default CartsManager;