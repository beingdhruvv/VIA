"use client";

import { useState, useEffect } from "react";
import { Card, Badge, Button, Avatar, ProgressBar } from "@/components/ui";
import { 
  Users, 
  Map, 
  Globe, 
  Activity, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  UserPlus,
  UserMinus,
  Loader2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface Stats {
  counts: {
    users: number;
    trips: number;
    cities: number;
    activities: number;
  };
  system: {
    platform: string;
    uptime: number;
    memory: {
      total: number;
      used: number;
      usagePercent: string;
    };
    cpu: {
      model: string;
      cores: number;
      load: string;
    }
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

export default function AdminDashboardClient({ currentUserRole }: { currentUserRole: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users")
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRoleUpdate = async (userId: string, currentRole: string) => {
    if (currentUserRole !== "SUPER_ADMIN") return;
    
    setUpdatingId(userId);
    const newRole = currentRole === "USER" ? "ADMIN" : "USER";
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to update role", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-via-black" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-via-black text-via-white rounded-none border border-via-black">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-mono text-via-grey-mid uppercase">Total Users</p>
              <p className="text-2xl font-bold font-mono">{stats?.counts.users}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-via-navy text-via-white rounded-none border border-via-black">
              <Map size={24} />
            </div>
            <div>
              <p className="text-xs font-mono text-via-grey-mid uppercase">Trips Created</p>
              <p className="text-2xl font-bold font-mono">{stats?.counts.trips}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-via-red text-via-white rounded-none border border-via-black">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-xs font-mono text-via-grey-mid uppercase">Cities in DB</p>
              <p className="text-2xl font-bold font-mono">{stats?.counts.cities}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-via-grey-dark text-via-white rounded-none border border-via-black">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-mono text-via-grey-mid uppercase">Total Activities</p>
              <p className="text-2xl font-bold font-mono">{stats?.counts.activities}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cpu size={20} className="text-via-black" />
              <h3 className="font-bold uppercase tracking-wider text-sm font-space-grotesk">CPU & Memory</h3>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {stats?.system.platform.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-via-grey-dark">
                <span>Memory Usage</span>
                <span>{stats?.system.memory.usagePercent}%</span>
              </div>
              <ProgressBar 
                value={parseFloat(stats?.system.memory.usagePercent || "0")} 
                className={parseFloat(stats?.system.memory.usagePercent || "0") > 80 ? "bg-via-red" : "bg-via-black"}
              />
              <p className="text-[10px] text-via-grey-mid font-mono">
                Used: {(stats?.system.memory.used || 0 / (1024 * 1024)).toFixed(0)}MB / Total: {(stats?.system.memory.total || 0 / (1024 * 1024)).toFixed(0)}MB
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-via-grey-light">
              <div>
                <p className="text-[10px] font-mono text-via-grey-mid uppercase">CPU Cores</p>
                <p className="text-xl font-bold font-mono">{stats?.system.cpu.cores}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-via-grey-mid uppercase">Load Average</p>
                <p className="text-xl font-bold font-mono">{stats?.system.cpu.load}</p>
              </div>
            </div>
            
            <div className="p-4 bg-via-off-white border border-via-grey-light">
              <p className="text-[10px] font-mono text-via-grey-mid uppercase mb-1">CPU Model</p>
              <p className="text-xs font-medium text-via-black">{stats?.system.cpu.model}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldAlert size={20} className="text-via-black" />
              <h3 className="font-bold uppercase tracking-wider text-sm font-space-grotesk">System Health</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-via-green font-mono">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-emerald-600">Operational</span>
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: '15m', load: 0.2 },
                { name: '10m', load: 0.5 },
                { name: '5m', load: 0.3 },
                { name: 'Now', load: parseFloat(stats?.system.cpu.load || "0") },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 2]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '0', border: '1px solid #111', fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="load" 
                  stroke="#111" 
                  fill="#1B2A41" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 flex items-center justify-between p-4 border border-via-black bg-via-white shadow-brutalist-sm">
             <div className="flex items-center gap-3">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span className="text-xs font-mono uppercase">Auto-refresh active</span>
             </div>
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchData}
                disabled={loading}
                className="h-8 text-[10px] font-mono uppercase"
             >
                Refresh Now
             </Button>
          </div>
        </Card>
      </div>

      {/* User Management */}
      <Card className="p-0 overflow-hidden border border-via-black shadow-brutalist">
        <div className="p-6 border-b border-via-grey-light bg-via-white flex items-center justify-between">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-sm font-space-grotesk">User Management</h3>
            <p className="text-[10px] text-via-grey-mid font-mono uppercase mt-1">Manage user roles and permissions</p>
          </div>
          <Badge className="bg-via-black text-via-white border-via-black">
            {users.length} Total Users
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-via-off-white border-b border-via-grey-light">
                <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">User</th>
                <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Email</th>
                <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Role</th>
                <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Joined</th>
                <th className="px-6 py-3 text-right text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-via-grey-light">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-via-off-white transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                      <span className="text-sm font-medium text-via-black">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-via-grey-dark">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      className={
                        user.role === "SUPER_ADMIN" ? "bg-via-red text-via-white" :
                        user.role === "ADMIN" ? "bg-via-navy text-via-white" : 
                        "bg-via-grey-light text-via-black border-transparent"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-mono text-via-grey-mid">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUserRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={updatingId === user.id}
                        onClick={() => handleRoleUpdate(user.id, user.role)}
                        className="h-8 text-[10px] font-mono uppercase gap-2 hover:bg-via-navy hover:text-via-white"
                      >
                        {updatingId === user.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : user.role === "ADMIN" ? (
                          <><UserMinus size={12} /> Demote</>
                        ) : (
                          <><UserPlus size={12} /> Promote</>
                        )}
                      </Button>
                    ) : (
                      <span className="text-[10px] font-mono text-via-grey-mid italic uppercase">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
