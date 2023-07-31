import { DynamicItem } from "../types/dynamics";

const checkDynamicType = (
  dynamicType: string
): boolean => ![
  'DYNAMIC_TYPE_LIVE_RCMD', // 直播开播
  'DYNAMIC_TYPE_LIVE', // 直播分享
].includes(dynamicType);

const parseDynamicData = (item: DynamicItem): {
  dynamicID: string,
  dynamicType: string,
  dynamicTypeCheck: boolean,
  ts: number,
  raw: string,
  origDynamic: {
    dynamicID: string,
    raw: string,
  } | undefined,
} => {
  let origDynamic: {
    dynamicID: string,
    raw: string,
  } | undefined = undefined;
  if (item.orig !== undefined) {
    const { dynamicID, dynamicTypeCheck, raw } = parseDynamicData(item.orig as DynamicItem)
    if (dynamicTypeCheck) {
      item.orig = `link:dynamic:${dynamicID}`;
      origDynamic = { dynamicID, raw };
    } else {
      item.orig = undefined;
    }
  }

  const dynamicID: string = item.id_str; // 动态ID
  const dynamicType: string = item.type; // 动态类型
  const dynamicTypeCheck: boolean = checkDynamicType(dynamicType); // 动态类型检查
  const ts: number = item.modules.module_author.pub_ts; // 动态发送时间戳(s)
  const raw: string = JSON.stringify(item); // 原始数据

  return { dynamicID, dynamicType, dynamicTypeCheck, ts, raw, origDynamic };
};
export default parseDynamicData;
