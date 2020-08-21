interface UserStateMap {
  [whatsappUserId: string]:
    | undefined
    | "ASK_NAME"
    | "CONFIRM_NAME"
    | "ASK_ADDRESS"
    | "CONFIRM_ADDRESS"
    | "SHOW_MENU"
    | "ADD_LIST"
    | "CONFIRM_LIST"
    | "ADD_PAYMENT"
    | "CONFIRM_PAYMENT"
    | "END";
}

interface UserObjectMap {
  [whatsappUserId: string]: {
    name: string | null;
    address: string | null;
    productList: {
      productName: string;
    }[];
    preferredPaymentMethod:
      | "DINHEIRO"
      | "CARTÃO DE DÉBITO"
      | "CARTÃO DE CRÉDITO"
      | null;
  };
}

let userObjectMap: UserObjectMap = {};
let userStateMap: UserStateMap = {};

export function doStateMachine(whatsappUserId: string, message: string) {
  console.log({ userStateMap, userObjectMap });

  message = message.trim();

  switch (userStateMap[whatsappUserId]) {
    case undefined: {
      userObjectMap[whatsappUserId] = {
        name: null,
        address: null,
        preferredPaymentMethod: null,
        productList: [],
      };
      userStateMap[whatsappUserId] = "ASK_NAME";
      return "Olá! Para começarmos, pode me dizer seu nome?";
    }

    case "ASK_NAME": {
      userObjectMap[whatsappUserId].name = message;
      userStateMap[whatsappUserId] = "CONFIRM_NAME";
      return (
        `Legal! Confirma que seu nome é ${userObjectMap[whatsappUserId].name}?\n\n` +
        `1- Sim\n` +
        `2 - Não`
      );
    }

    case "CONFIRM_NAME": {
      if (message == "1") {
        userStateMap[whatsappUserId] = "ASK_ADDRESS";
        return (
          `Ótimo, agora eu preciso do seu endereço! Pode ser no formato:\n\n` +
          `Rua Fulano, número 404, apartamento 20`
        );
      } else if (message == "2") {
        userStateMap[whatsappUserId] = "ASK_NAME";
        return "Ok, por favor digite seu nome:";
      } else {
        return `Por favor, escolha uma das opções acima!`;
      }
    }

    case "ASK_ADDRESS": {
      userObjectMap[whatsappUserId].address = message;
      userStateMap[whatsappUserId] = "CONFIRM_ADDRESS";
      return (
        `Legal! Confirma que seu endereço é ${userObjectMap[whatsappUserId].address}?\n\n` +
        `1 - Sim\n` +
        `2 - Não`
      );
    }

    case "CONFIRM_ADDRESS": {
      if (message == "1") {
        userStateMap[whatsappUserId] = "SHOW_MENU";
        return (
          `*Escolha uma das opções abaixo:*\n\n` +
          `1 - Criar nova lista de compras\n` +
          `2 - Continuar lista de compras\n` +
          `3 - Trocar meu nome\n` +
          `4 - Trocar meu endereço`
        );
      } else if (message == "2") {
        userStateMap[whatsappUserId] = "ASK_ADDRESS";
        return "Ok, por favor digite seu endereço:";
      } else {
        return `Por favor, escolha uma das opções acima!`;
      }
    }

    case "SHOW_MENU": {
      if (message == "1") {
        userStateMap[whatsappUserId] = "ADD_LIST";
        userObjectMap[whatsappUserId].productList = []; ///vai pra lista só que limpando
        return (
          `*Sua lista atual é:*\n` +
          userObjectMap[whatsappUserId].productList
            .map((x) => x.productName)
            .join("\n") +
          "\n\n" +
          `Digite o *nome do produto* para adicioná-lo a lista.\n` +
          `Digite *"Finalizar"* para finalizar a lista\n` +
          `Digite *"Cancelar"* para ir para o menu`
        );
      }

      if (message == "2") {
        userStateMap[whatsappUserId] = "ADD_LIST";

        return (
          `*Sua lista atual é:*\n` +
          userObjectMap[whatsappUserId].productList
            .map((x) => x.productName)
            .join("\n") +
          "\n\n" +
          `Digite o *nome do produto* para adicioná-lo a lista.\n` +
          `Digite *"Finalizar"* para finalizar a lista\n` +
          `Digite *"Cancelar"* para ir para o menu`
        );
      }

      if (message == "3") {
        userStateMap[whatsappUserId] = "ASK_NAME";
        return "Ok, por favor digite seu nome:";
      }

      if (message == "4") {
        userStateMap[whatsappUserId] = "ASK_ADDRESS";
        return "Ok, por favor digite seu endereço:";
      }
    }

    case "ADD_LIST": {
      if (message.toLocaleUpperCase() == "FINALIZAR") {
        userStateMap[whatsappUserId] = "CONFIRM_LIST";
        return (
          `Confirma que deseja finalizar sua lista com:\n` +
          userObjectMap[whatsappUserId].productList
            .map((x) => x.productName)
            .join("\n") +
          "\n\n" +
          `1 - Sim\n` +
          `2 - Não`
        );
      }

      if (message.toLocaleUpperCase() == "CANCELAR") {
        userStateMap[whatsappUserId] = "SHOW_MENU";
        return (
          `*Escolha uma das opções abaixo:*\n\n` +
          `1 - Criar nova lista de compras\n` +
          `2 - Continuar lista de compras\n` +
          `3 - Trocar meu nome\n` +
          `4 - Trocar meu endereço`
        );
      }

      userObjectMap[whatsappUserId].productList.push({ productName: message });

      return (
        `*Sua lista atual é:*\n` +
        userObjectMap[whatsappUserId].productList
          .map((x) => x.productName)
          .join("\n") +
        "\n\n" +
        `Digite o *nome do produto* para adicioná-lo a lista.\n` +
        `Digite *"Finalizar"* para finalizar a lista\n` +
        `Digite *"Cancelar"* para ir para o menu`
      );
    }

    case "CONFIRM_LIST": {
      if (message == "1") {
        userStateMap[whatsappUserId] = "ADD_PAYMENT";
        return (
          `Ótimo, agora eu preciso do seu método de pagamento! *Escolha uma das opções abaixo:*\n\n` +
          `1 - Dinheiro\n` +
          `2 - Cartão de Crédito\n` +
          `3 - Cartão de Débito`
        );
      } else if (message == "2") {
        userStateMap[whatsappUserId] = "ADD_LIST";
        return (
          `*Sua lista atual é:*\n` +
          userObjectMap[whatsappUserId].productList
            .map((x) => x.productName)
            .join("\n") +
          "\n\n" +
          `Digite o *nome do produto* para adicioná-lo a lista.\n` +
          `Digite *"Finalizar"* para finalizar a lista\n` +
          `Digite *"Cancelar"* para ir para o menu`
        );
      } else {
        return `Por favor, escolha uma das opções acima!`;
      }
    }

    case "ADD_PAYMENT": {
      //olha esse js pitônico, vê se tá na lista, cria um mapa e já resolve ele
      if (["1", "2", "3"].includes(message)) {
        userObjectMap[whatsappUserId].preferredPaymentMethod = {
          "1": "DINHEIRO",
          "2": "CARTÃO DE CRÉDITO",
          "3": "CARTÃO DE DÉBITO",
        }[message] as "DINHEIRO" | "CARTÃO DE CRÉDITO" | "CARTÃO DE DÉBITO";

        userStateMap[whatsappUserId] = "CONFIRM_PAYMENT";
        return (
          `Confirma que seu método de pagamento é ${userObjectMap[whatsappUserId].preferredPaymentMethod}?\n\n` +
          `1 - Sim\n` +
          `2 - Não`
        );
      } else {
        return `Por favor, escolha uma das opções acima!`;
      }
    }

    case "CONFIRM_PAYMENT": {
      if (message == "1") {
        userStateMap[whatsappUserId] = "END";
        return (
          `*Confira pra mim todos os dados do seu pedido abaixo!*\n\n` +
          userObjectMap[whatsappUserId].productList
            .map((x) => x.productName)
            .join("\n") +
          "\n\n" +
          `Nome: ${userObjectMap[whatsappUserId].name}\n` +
          `Endereço: ${userObjectMap[whatsappUserId].address}\n` +
          `Método de pagamento: ${userObjectMap[whatsappUserId].preferredPaymentMethod}\n\n` +
          `1 - Confirmado, finalizar pedido\n` +
          `2 - Voltar para o menu`
        );
      } else if (message == "2") {
        userStateMap[whatsappUserId] = "ADD_PAYMENT";
        return (
          `*Escolha uma das opções de pagamento abaixo:*\n\n` +
          `1 - Dinheiro\n` +
          `2 - Cartão de Crédito\n` +
          `3 - Cartão de Débito`
        );
      } else {
        return `Por favor, escolha uma das opções acima!`;
      }
    }

    case "END": {
      if (message == "1") {
        userStateMap[whatsappUserId] = "SHOW_MENU";
        return (
          `*Pedido realizado com sucesso! Obrigado por comprar na teepad.*\n\n` +
          `Dados finais do pedido:\n` +
          userObjectMap[whatsappUserId].productList
            .map((x) => x.productName)
            .join("\n") +
          "\n\n" +
          `Nome: ${userObjectMap[whatsappUserId].name}\n` +
          `Endereço: ${userObjectMap[whatsappUserId].address}\n` +
          `Método de pagamento: ${userObjectMap[whatsappUserId].preferredPaymentMethod}\n\n` +
          `*Escolha uma das opções abaixo:*\n\n` +
          `1 - Criar nova lista de compras\n` +
          `2 - Continuar lista de compras\n` +
          `3 - Trocar meu nome\n` +
          `4 - Trocar meu endereço`
        );
      } else if (message == "2") {
        userStateMap[whatsappUserId] = "SHOW_MENU";
        return (
          `*Escolha uma das opções abaixo:*\n\n` +
          `1 - Criar nova lista de compras\n` +
          `2 - Continuar lista de compras\n` +
          `3 - Trocar meu nome\n` +
          `4 - Trocar meu endereço`
        );
      } else {
        return `Por favor, escolha uma das opções acima!`;
      }
    }

    default: {
      userStateMap[whatsappUserId] = "SHOW_MENU";
      return "Perdão, essa opção não é válida, tente novamente";
    }
  }
}
