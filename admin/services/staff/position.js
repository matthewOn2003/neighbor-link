import { request } from "../request";

export const positionCreate = (body) => request("/staff-position/create", body);

export const positionUpdate = (id, body) => request(`/staff-position/update/${id}`, body);

export const positionDelete = (id) => request(`/staff-position/delete/${id}`);
