"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, Badge, Button, Avatar, ProgressBar } from "@/components/ui";
import { 
  Users, 
  Map, 
  Globe, 
  Activity, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  UserPlus,
  UserMinus,
  Loader2,
  Trash2
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent
} from "@/components/ui";

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

interface AdminCity {
  id: string;
  name: string;
  country: string;
  region: string;
  popularityScore: number;
  imageUrl?: string | null;
}

interface AdminTrip {
  id: string;
  name: string;
  status: string;
  user: { name: string; email: string };
  _count: { stops: number; expenses: number };
}

interface AdminActivity {
  id: string;
  name: string;
  cityId: string;
  category: string;
  estimatedCost: number;
  avgCost?: number;
}

export default function AdminDashboardClient({ currentUserRole }: { currentUserRole: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // New management states
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [mgmtLoading, setMgmtLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users")
      ]);
      const statsData: Stats = await statsRes.json();
      const usersData: User[] = await usersRes.json();
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManagementData = useCallback(async (type: string) => {
    setMgmtLoading(true);
    try {
      const res = await fetch(`/api/admin/${type}`);
      const data = await res.json();
      if (type === "cities") setCities(data as AdminCity[]);
      if (type === "trips") setTrips(data as AdminTrip[]);
      if (type === "activities") setActivities(data as AdminActivity[]);
    } catch (error) {
      console.error(`Failed to fetch ${type}`, error);
    } finally {
      setMgmtLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialFetch = setTimeout(() => {
      void fetchData();
    }, 0);
    const interval = setInterval(() => {
      void fetchData();
    }, 30000);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchData]);

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

      <Tabs 
        defaultValue="overview" 
        className="space-y-6"
        onValueChange={(value) => {
          if (["cities", "trips", "activities"].includes(value)) {
            void fetchManagementData(value);
          }
        }}
      >
        <TabsList className="bg-via-white border-2 border-via-black p-1 shadow-brutalist-sm">
          <TabsTrigger value="overview" className="font-mono text-xs uppercase">Overview</TabsTrigger>
          <TabsTrigger value="users" className="font-mono text-xs uppercase">Users</TabsTrigger>
          <TabsTrigger value="cities" className="font-mono text-xs uppercase">Cities</TabsTrigger>
          <TabsTrigger value="trips" className="font-mono text-xs uppercase">Trips</TabsTrigger>
          <TabsTrigger value="activities" className="font-mono text-xs uppercase">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-300">
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
                Used: {((stats?.system.memory.used || 0) / (1024 * 1024)).toFixed(0)}MB / Total: {((stats?.system.memory.total || 0) / (1024 * 1024)).toFixed(0)}MB
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

        </TabsContent>

        <TabsContent value="users">
          <Card className="p-0 overflow-hidden border-2 border-via-black shadow-brutalist">
            <div className="p-6 border-b-2 border-via-black bg-via-white flex items-center justify-between">
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
                  <tr className="bg-via-off-white border-b-2 border-via-black">
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
        </TabsContent>

        <TabsContent value="cities">
          <Card className="p-0 overflow-hidden border-2 border-via-black shadow-brutalist">
            <div className="p-6 border-b-2 border-via-black bg-via-white flex items-center justify-between">
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm font-space-grotesk">City Database</h3>
                <p className="text-[10px] text-via-grey-mid font-mono uppercase mt-1">Add, edit or remove world cities</p>
              </div>
              <Button variant="primary" size="sm" className="font-mono text-xs uppercase">+ Add City</Button>
            </div>
            
            {mgmtLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin mx-auto text-via-black" size={24} />
              </div>
            ) : cities.length === 0 ? (
              <div className="p-12 text-center text-via-grey-mid font-mono text-xs uppercase tracking-widest">
                No cities found in database
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-via-off-white border-b-2 border-via-black">
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">City</th>
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Country</th>
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Region</th>
                      <th className="px-6 py-3 text-right text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-via-grey-light">
                    {cities.map((city) => (
                      <tr key={city.id} className="hover:bg-via-off-white transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border border-via-black overflow-hidden bg-via-grey-light relative">
                              {city.imageUrl ? (
                                <Image src={city.imageUrl} alt={city.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-via-grey-mid">
                                  <Globe size={16} />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-via-black">{city.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-via-grey-dark uppercase">
                          {city.country}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-via-grey-mid">
                          {city.region}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <RefreshCw size={14} />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-via-red hover:bg-via-red hover:text-via-white">
                              <Trash2 size={14} />
                           </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card className="p-0 overflow-hidden border-2 border-via-black shadow-brutalist">
             <div className="p-6 border-b-2 border-via-black bg-via-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-sm font-space-grotesk">Global Trips</h3>
                  <p className="text-[10px] text-via-grey-mid font-mono uppercase mt-1">Overview of all planned and active trips</p>
                </div>
             </div>
             {mgmtLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin mx-auto text-via-black" size={24} />
              </div>
            ) : trips.length === 0 ? (
              <div className="p-12 text-center text-via-grey-mid font-mono text-xs uppercase tracking-widest">
                No trips found in database
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-via-off-white border-b-2 border-via-black">
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Trip Name</th>
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Owner</th>
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Stats</th>
                      <th className="px-6 py-3 text-right text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-via-grey-light">
                    {trips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-via-off-white transition-colors group">
                        <td className="px-6 py-4">
                           <span className="text-sm font-medium text-via-black">{trip.name}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-xs font-medium text-via-black">{trip.user.name}</span>
                              <span className="text-[10px] font-mono text-via-grey-mid">{trip.user.email}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex gap-2">
                              <Badge variant="outline" className="text-[9px] font-mono">{trip._count.stops} STOPS</Badge>
                              <Badge variant="outline" className="text-[9px] font-mono">{trip._count.expenses} EXP</Badge>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-via-red hover:bg-via-red hover:text-via-white">
                              <Trash2 size={14} />
                           </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card className="p-0 overflow-hidden border-2 border-via-black shadow-brutalist">
             <div className="p-6 border-b-2 border-via-black bg-via-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-sm font-space-grotesk">Activity Library</h3>
                  <p className="text-[10px] text-via-grey-mid font-mono uppercase mt-1">Manage global activity templates</p>
                </div>
                <Button variant="primary" size="sm" className="font-mono text-xs uppercase">+ Create Template</Button>
             </div>
             {mgmtLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin mx-auto text-via-black" size={24} />
              </div>
            ) : activities.length === 0 ? (
              <div className="p-12 text-center text-via-grey-mid font-mono text-xs uppercase tracking-widest">
                No activity templates found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-via-off-white border-b-2 border-via-black">
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Activity</th>
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Category</th>
                      <th className="px-6 py-3 text-left text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Cost Info</th>
                      <th className="px-6 py-3 text-right text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-via-grey-light">
                    {activities.map((act) => (
                      <tr key={act.id} className="hover:bg-via-off-white transition-colors group">
                        <td className="px-6 py-4">
                           <span className="text-sm font-medium text-via-black">{act.name}</span>
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant="outline" className="text-[10px] font-mono uppercase">{act.category}</Badge>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-via-grey-mid">
                           Avg: ₹{act.avgCost || 0}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <RefreshCw size={14} />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-via-red hover:bg-via-red hover:text-via-white">
                              <Trash2 size={14} />
                           </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
