/**
 * 获取 dynamicItem 下所有 *.hdslb.com 的资源url
 * @param obj dynamicItem
 * @returns dynamicID as array
 */
export const getAssets = (obj: { [key: string | number]: any } | any[]): string[] => {
  const assets: string[] = [];
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      if (/^(https?:)?\/\/.*\.?hdslb\.com\/.+$/.test(value)) {
        if (!assets.includes(value)) assets.push(value);
      }
    } else if (typeof value === "object") {
      assets.push(...getAssets(value).filter((v) => !assets.includes(v)));
    }
  }
  return assets;
};
