import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}
  getAllUsers(): Observable<any[]> { return this.http.get<any[]>(`${environment.apiUrl}/admin/users`); }
  getPendingUsers(): Observable<any[]> { return this.http.get<any[]>(`${environment.apiUrl}/admin/users/pending`); }
  approveUser(id: number): Observable<any> { return this.http.patch(`${environment.apiUrl}/admin/users/${id}/approve`, {}); }
  rejectUser(id: number): Observable<any> { return this.http.patch(`${environment.apiUrl}/admin/users/${id}/reject`, {}); }
  changeRole(id: number, role: string): Observable<any> { return this.http.patch(`${environment.apiUrl}/admin/users/${id}/role`, { role }); }
  deleteUser(id: number): Observable<any> { return this.http.delete(`${environment.apiUrl}/admin/users/${id}`); }
}
