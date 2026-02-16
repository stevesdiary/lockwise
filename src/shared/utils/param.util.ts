export const asString = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};
