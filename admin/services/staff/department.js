import { request } from "../request";

export const departmentCreate = (body) => request("/staff-department/create", body);

export const departmentUpdate = (id, body) => request(`/staff-department/update/${id}`, body);

export const departmentDelete = (id) => request(`/staff-department/delete/${id}`);
