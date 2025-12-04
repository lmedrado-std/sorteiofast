
// src/lib/config.ts
// Estes são os valores padrão. As configurações podem ser substituídas
// dinamicamente pelo painel do administrador e salvas no localStorage.

/**
 * O valor mínimo de venda para gerar um cupom.
 * A cada múltiplo deste valor, um novo cupom é gerado.
 * Ex: Se o valor for 1000, uma venda de R$ 2500 gera 2 cupons.
 */
export const COUPON_VALUE_THRESHOLD = 1000;


/**
 * A data final da campanha de vendas.
 * O formato é 'YYYY-MM-DDTHH:mm:ss'.
 * O contador na página de vendas usará esta data para a contagem regressiva.
 */
export const CAMPAIGN_END_DATE = '2024-12-31T23:59:59';
