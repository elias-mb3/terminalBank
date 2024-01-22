//Internal Modules
import chalk from "chalk";
import inquirer from "inquirer";

//External Module
import fs from "fs";
import { get } from "https";

const operation = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Depositar",
          "Consultar Saldo",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answers) => {
      const action = answers["action"];
      if (action === "Criar conta") {
        createAccount();
        buildAccount();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Consultar Saldo") {
        getAccountBalance();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Sair") {
        console.log(chalk.blue("Obrigado por usar o nosso sistema!"));
        process.exit();
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const createAccount = () => {
  console.log(chalk.blue(`Seja bem vindo ao Monteiro's Bank`));
  console.log(chalk.blue(`Obrigado por escolher nosso Banco`));
  console.log(chalk.green(`Defina as opções para criar a sua conta`));
};

const buildAccount = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual nome da conta?",
      },
    ])
    .then((answers) => {
      const accountName = answers["accountName"];

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.red("Essa conta já existe!! Por favor escolha outro nome!")
        );
        buildAccount();
        return;
      }
      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        (err) => {
          console.log(err);
        }
      );
      console.log(chalk.green("Parabéns!!! Sua conta foi criada com sucesso"));
      operation();
    })
    .catch((err) => {
      console.error(err);
    });
};

const deposit = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answers) => {
      const accountName = answers["accountName"];

      if (!verifyAccounts(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answers) => {
          const amount = answers["amount"];
          //add amount
          addAmount(accountName, amount);
          //return to home
          operation();
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
};

const verifyAccounts = (accountName) => {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.red("Está conta não existe, escolha outro nome"));
    return false;
  }
  return true;
};
const addAmount = (accountName, amount) => {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.red("Ocorreu um erro, tente novamente mais tarde!"));
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi depositado um valor de R$${amount} na sua conta!`)
  );
};

const getAccount = (accountName) => {
  const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf-8",
    flag: "r",
  });
  return JSON.parse(accountJson);
};

const getAccountBalance = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answers) => {
      const accountName = answers["accountName"];

      if (!verifyAccounts(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.green(`Olá, o saldo na sua conta é de R${accountData.balance}`)
      );
      operation();
    })
    .catch((err) => {
      console.error(err);
    });
};

const withdraw = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answers) => {
      const accountName = answers["accountName"];

      if (!verifyAccounts(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((answers) => {
          const amount = answers["amount"];

          removeAmount(accountName, amount);
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
};

const removeAmount = (accountName, amount) => {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.red("Ocorreu um erro, tente novamente mais tarde!"));
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.red("Saldo Indisponível!"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    }
  );

  console.log(chalk.green(`Saque de R$${amount} realizado com sucesso!`));
  operation();
};

operation();
