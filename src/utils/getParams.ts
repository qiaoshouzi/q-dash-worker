/**
 * { key: value } => "key=value&key=value"
 */
export default (data: { [key: string]: string | number | null | undefined }): string => {
  let out: string = "";
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      out += `${key}=${data[key]}&`;
    }
  }
  return out.slice(0, -1);
};
