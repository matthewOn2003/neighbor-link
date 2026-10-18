import { defineApi } from "../defineApi";
const call = (id) => defineApi({ path: `/tenant/detail/${id}` })();
export const tenantDetail = ({ id }) => call(id);