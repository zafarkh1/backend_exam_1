import { createServer } from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { readFileCustom } from "./helpers/read-helper.js";
import { writeFileCustom } from "./helpers/write-helper.js";
import { sign, verify } from "./helpers/jwt-helper.js";
import { read } from "fs";

dotenv.config();

const PORT = 2024;
const options = {
  "Content-Type": "application/json",
};

const server = createServer((req, res) => {
  const method = req.method;
  const url = req.url.split("/")[1];
  const urlId = req.url.split("/")[2];

  const checkAdmin = (accessToken) => {
    try {
      const { id, role } = verify(accessToken);

      if (role != "admin") {
        res.writeHead(403, options);
        res.end(
          JSON.stringify({
            message: "Access denied",
          })
        );
        return;
      }
      return user;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Access expired",
          })
        );
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Access invalid",
          })
        );
        return;
      }
    }
  };

  if (method == "GET") {
    if (url == "markets") {
      const marketId = urlId;

      if (urlId > 0) {
        const allMarkets = readFileCustom("markets.json");
        const Branches = readFileCustom("branches.json");

        const foundMarket = allMarkets.find((el) => el.id == marketId);
        if (!foundMarket) {
          res.writeHead(401, options);
          res.end(
            JSON.stringify({
              message: "Market not found",
            })
          );
          return;
        }
        const marketBranches = Branches.filter(
          (el) => el.id == marketId
        ).filter((el) => delete el.marketId);

        foundMarket.Branches = marketBranches;

        res.writeHead(200, options);
        res.end(JSON.stringify(foundMarket));
      } else if (!urlId) {
        const allMarkets = readFileCustom("markets.json");

        res.writeHead(200, options);
        res.end(JSON.stringify(allMarkets));
      } else {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Error",
          })
        );
      }
    }
    if (url == "branches") {
      const branchId = urlId;

      if (branchId >= 0) {
        const Branches = readFileCustom("branches.json");
        const Products = readFileCustom("products.json");

        for (let i of Branches) {
          delete i.marketId;
        }

        const foundBranch = Branches.find((el) => el.id == branchId);

        if (!foundBranch) {
          res.writeHead(401, options);
          res.end(
            JSON.stringify({
              message: "Branch not found",
            })
          );
          return;
        }
        const marketProducts = Products.filter(
          (el) => el.id == branchId
        ).filter((el) => delete el.branchId);

        foundBranch.Products = marketProducts;

        res.writeHead(200, options);
        res.end(JSON.stringify(foundBranch));
      } else if (!urlId) {
        const Branches = readFileCustom("branches.json");
        for (let i of Branches) {
          delete i.marketId;
        }
        res.writeHead(200, options);
        res.end(JSON.stringify(Branches));
      } else {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Error",
          })
        );
      }
    }
    if (url == "employees") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      const employeeId = urlId;

      if (employeeId >= 0) {
        const Branches = readFileCustom("branches.json");
        const Employees = readFileCustom("employees.json");

        for (let i of Employees) {
          delete i.branchId;
        }

        const foundEmployee = Employees.find((el) => el.id == employeeId);

        if (!foundEmployee) {
          res.writeHead(401, options);
          res.end(
            JSON.stringify({
              message: "Employee not found",
            })
          );
          return;
        }

        res.writeHead(200, options);
        res.end(JSON.stringify(foundEmployee));
      } else if (!urlId) {
        const Employees = readFileCustom("employees.json");

        for (let i of Employees) {
          delete i.branchId;
        }
        res.writeHead(200, options);
        res.end(JSON.stringify(Employees));
      } else {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Error",
          })
        );
      }
    }
    if (url == "products") {
      const productId = urlId;

      if (productId >= 0) {
        const Branches = readFileCustom("branches.json");
        const Products = readFileCustom("products.json");

        for (let i of Products) {
          delete i.branchId;
        }

        const foundProduct = Products.find((el) => el.id == productId);

        if (!foundProduct) {
          res.writeHead(401, options);
          res.end(
            JSON.stringify({
              message: "Product not found",
            })
          );
          return;
        }

        res.writeHead(200, options);
        res.end(JSON.stringify(foundProduct));
      } else if (!urlId) {
        const Products = readFileCustom("products.json");
        for (let i of Products) {
          delete i.branchId;
        }
        res.writeHead(200, options);
        res.end(JSON.stringify(Products));
      } else {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Error",
          })
        );
      }
    }
    if (url == "users") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      const userId = urlId;

      if (userId >= 0) {
        const Users = readFileCustom("users.json");

        const foundUser = Users.find((el) => el.id == userId);

        if (!foundUser) {
          res.writeHead(401, options);
          res.end(
            JSON.stringify({
              message: "User not found",
            })
          );
          return;
        }

        res.writeHead(200, options);
        res.end(JSON.stringify(foundUser));
      } else if (!urlId) {
        const Users = readFileCustom("users.json");
        res.writeHead(200, options);
        res.end(JSON.stringify(Users));
      } else {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Error",
          })
        );
      }
    }
  }
  if (method == "POST") {
    if (url == "sign-in") {
      req.on("data", (chunk) => {
        const { username, password } = JSON.parse(chunk);

        const user = readFileCustom("users.json").find(
          (el) => el.username == username && el.password && password
        );

        if (!user) {
          res.writeHead(401, options);
          res.end(
            JSON.stringify({
              message: "Unauthorized",
            })
          );
          return;
        }
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            message: "Authorized",
            accessToken: sign({ id: user.id, role: user.role }),
          })
        );
        return;
      });
    }
    if (url == "markets") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      req.on("data", (chunk) => {
        const { marketName } = JSON.parse(chunk);

        const allMarket = readFileCustom("markets.json");
        allMarket.push({
          id: allMarket.at(-1).id + 1 || 1,
          marketName,
        });
        writeFileCustom("markets.json", allMarket);
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            message: "Market successfully created",
          })
        );
        return;
      });
    }
    if (url == "branches") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      req.on("data", (chunk) => {
        const { branchName, marketId } = JSON.parse(chunk);

        const allBranches = readFileCustom("branches.json");
        allBranches.push({
          id: allBranches.at(-1).id + 1 || 1,
          branchName,
          marketId,
        });
        writeFileCustom("branches.json", allBranches);
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            message: "Branch successfully created",
          })
        );
        return;
      });
    }
    if (url == "employees") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      req.on("data", (chunk) => {
        const { name, gender, branchId } = JSON.parse(chunk);

        const allEmployees = readFileCustom("employees.json");
        allEmployees.push({
          id: allEmployees.at(-1).id + 1 || 1,
          name,
          gender,
          branchId,
        });
        writeFileCustom("employees.json", allEmployees);
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            message: "Employee successfully created",
          })
        );
        return;
      });
    }
    if (url == "products") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      req.on("data", (chunk) => {
        const { title, price, branchId } = JSON.parse(chunk);

        const allProducts = readFileCustom("products.json");
        allProducts.push({
          id: allProducts.at(-1).id + 1 || 1,
          title,
          price,
          branchId,
        });
        writeFileCustom("products.json", allProducts);
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            message: "Products successfully created",
          })
        );
        return;
      });
    }
    if (url == "users") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      req.on("data", (chunk) => {
        const { username, password, role } = JSON.parse(chunk);

        const allUsers = readFileCustom("users.json");
        allUsers.push({
          id: allUsers.at(-1).id + 1 || 1,
          username,
          password,
          role,
        });
        writeFileCustom("users.json", allUsers);
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            message: "User successfully created",
          })
        );
        return;
      });
    }
  }
  if (method == "PATCH") {
    if (url == "markets") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      const marketId = urlId;

      const allMarkets = readFileCustom("markets.json");

      const foundMarket = allMarkets.find((el) => el.id == marketId);
      if (!foundMarket) {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Market not found",
          })
        );
        return;
      }

      req.on("data", (chunk) => {
        const { marketName } = JSON.parse(chunk);
        foundMarket.marketName = marketName;

        const marketIndex = allMarkets.findIndex((el) => el.id == marketId);
        allMarkets.splice(marketIndex, 1);
        allMarkets.push(foundMarket);

        writeFileCustom("markets.json", allMarkets);
      });
      res.writeHead(200, options);
      res.end(
        JSON.stringify({
          message: "Market successfully updated",
        })
      );
    }
    if (url == "branches") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      const branchId = urlId;

      const allBranches = readFileCustom("branches.json");

      for (let i of allBranches) {
        delete i.marketId;
      }

      const foundBranch = allBranches.find((el) => el.id == branchId);
      if (!foundBranch) {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Branch not found",
          })
        );
        return;
      }

      req.on("data", (chunk) => {
        const { branchName } = JSON.parse(chunk);
        foundBranch.branchName = branchName;

        const branchIndex = allBranches.findIndex((el) => el.id == branchId);
        allBranches.splice(branchIndex, 1);
        allBranches.push(foundBranch);

        writeFileCustom("branches.json", allBranches);
      });
      res.writeHead(200, options);
      res.end(
        JSON.stringify({
          message: "Branch successfully updated",
        })
      );
    }
    if (url == "products") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      const productId = urlId;

      const allProducts = readFileCustom("products.json");

      // for (let i of allProducts) {
      //   delete i.branchId;
      // }

      const foundProduct = allProducts.find((el) => el.id == productId);
      if (!foundProduct) {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Product not found",
          })
        );
        return;
      }

      req.on("data", (chunk) => {
        const { title, price } = JSON.parse(chunk);
        foundProduct.title = title;
        foundProduct.price = price;

        const productIndex = allProducts.findIndex((el) => el.id == productId);
        allProducts.splice(productIndex, 1);
        allProducts.push(foundProduct);

        writeFileCustom("products.json", allProducts);
      });
      res.writeHead(200, options);
      res.end(
        JSON.stringify({
          message: "Product successfully updated",
        })
      );
    }
  }
  if (method == "DELETE") {
    if (url == "markets") {
      const accessToken = req.headers["authorization"];
      checkAdmin(accessToken);

      const marketId = urlId;

      const allMarkets = readFileCustom("markets.json");

      const foundMarket = allMarkets.find((el) => el.id == marketId);
      if (!foundMarket) {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            message: "Market not found",
          })
        );
        return;
      }

      const marketIndex = allMarkets.findIndex((el) => el.id == marketId);
      allMarkets.splice(marketIndex, 1);

      writeFileCustom("markets.json", allMarkets);
      res.writeHead(200, options);
      res.end(
        JSON.stringify({
          message: "Market successfully updated",
        })
      );
      return;
    }
  }
});

server.listen(PORT, console.log("waiting ..."));
