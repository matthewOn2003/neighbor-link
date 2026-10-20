import { request } from "../request";

export const accountCreate = (body) => request("/staff-account/create", body);

export const accountUpdate = (id, body) => request(`/staff-account/update/${id}`, body);

export const accountDelete = (id) => request(`/staff-account/delete/${id}`);
