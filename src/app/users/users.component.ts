import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export type UserRole = 'ADMIN' | 'USER';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface UserRow {
  name: string;
  email: string;
  role: UserRole;
  team: string;
  status: UserStatus;
  lastActive: string;
}

export interface UserStatusCard {
  label: string;
  value: number;
  icon: string;
  type: 'total' | 'active' | 'admins' | 'members';
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator)
  set paginatorRef(p: MatPaginator | undefined) {
    if (p) this.usersDataSource.paginator = p;
  }

  searchText = '';
  roleFilter: UserRole | '' = '';

  roleFilterOptions: { value: '' | UserRole; label: string }[] = [
    { value: '', label: 'All roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'USER', label: 'Standard' },
  ];

  mockUsers: UserRow[] = [
    {
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'ADMIN',
      team: 'Platform Admin',
      status: 'Active',
      lastActive: 'Online now',
    },
    {
      name: 'Standard User',
      email: 'non-admin@test.com',
      role: 'USER',
      team: 'Operations',
      status: 'Active',
      lastActive: '12 minutes ago',
    },
  ];

  displayedColumns = ['name', 'email', 'team', 'role', 'status', 'lastActive'];

  usersDataSource = new MatTableDataSource<UserRow>([]);

  ngOnInit(): void {
    this.refreshUserRows();
  }

  refreshUserRows(): void {
    let list = [...this.mockUsers];
    if (this.roleFilter) {
      list = list.filter(u => u.role === this.roleFilter);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      list = list.filter(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.team.toLowerCase().includes(q),
      );
    }
    this.usersDataSource.data = list;
    this.usersDataSource.paginator?.firstPage();
  }

  get summaryText(): string {
    const admins = this.mockUsers.filter(u => u.role === 'ADMIN').length;
    const active = this.mockUsers.filter(u => u.status === 'Active').length;
    return `${active} active • ${admins} admin${admins === 1 ? '' : 's'} • ${this.mockUsers.length} total`;
  }

  get statusCards(): UserStatusCard[] {
    const total = this.mockUsers.length;
    const active = this.mockUsers.filter(u => u.status === 'Active').length;
    const admins = this.mockUsers.filter(u => u.role === 'ADMIN').length;
    const members = this.mockUsers.filter(u => u.role === 'USER').length;
    return [
      { label: 'Total Users', value: total, icon: 'groups', type: 'total' },
      { label: 'Active', value: active, icon: 'check_circle', type: 'active' },
      { label: 'Admins', value: admins, icon: 'admin_panel_settings', type: 'admins' },
      { label: 'Standard', value: members, icon: 'person', type: 'members' },
    ];
  }

  getStatusClass(status: UserStatus): string {
    const map: Record<UserStatus, string> = {
      Active: 'badge-active',
      Inactive: 'badge-inactive',
      Suspended: 'badge-suspended',
    };
    return map[status] || 'badge-inactive';
  }

  getRoleClass(role: UserRole): string {
    return role === 'ADMIN' ? 'role-badge--admin' : 'role-badge--user';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
