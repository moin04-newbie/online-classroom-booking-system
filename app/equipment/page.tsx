"use client"

import LayoutShell from "@/components/layout-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Settings, Zap, Wifi, Camera, Mic } from "lucide-react"
import { motion } from "framer-motion"

interface Equipment {
  id: string
  name: string
  type: string
  model?: string
  serialNumber?: string
  status: "available" | "in-use" | "maintenance" | "broken"
  location?: string
  assignedTo?: string
  createdAt: number
  lastMaintenance?: number
  notes?: string
}

const statusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  "in-use": "bg-blue-100 text-blue-800 border-blue-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  broken: "bg-red-100 text-red-800 border-red-200"
}

const equipmentIcons = {
  Projector: Settings,
  Laptop: Zap,
  Speaker: Mic,
  Camera: Camera,
  Router: Wifi,
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Equipment | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    model: "",
    serialNumber: "",
    status: "available" as Equipment["status"],
    location: "",
    assignedTo: "",
    notes: ""
  })

  useEffect((): void => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment')
      const data = await response.json()
      // Ensure data is always an array
      setEquipment(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
      setEquipment([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const url = editingItem ? `/api/equipment/${editingItem.id}` : '/api/equipment'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchEquipment()
        setDialogOpen(false)
        setEditingItem(null)
        setFormData({
          name: "",
          type: "",
          model: "",
          serialNumber: "",
          status: "available",
          location: "",
          assignedTo: "",
          notes: ""
        })
      }
    } catch (error) {
      console.error('Error saving equipment:', error)
    }
  }

  const handleEdit = (item: Equipment) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      type: item.type,
      model: item.model || "",
      serialNumber: item.serialNumber || "",
      status: item.status,
      location: item.location || "",
      assignedTo: item.assignedTo || "",
      notes: item.notes || ""
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      try {
        const response = await fetch(`/api/equipment/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await fetchEquipment()
        }
      } catch (error) {
        console.error('Error deleting equipment:', error)
      }
    }
  }

  const getStatusStats = () => {
    // Ensure equipment is an array before using reduce
    if (!Array.isArray(equipment)) {
      return [
        { label: "Available", value: 0, color: "text-green-600" },
        { label: "In Use", value: 0, color: "text-blue-600" },
        { label: "Maintenance", value: 0, color: "text-yellow-600" },
        { label: "Broken", value: 0, color: "text-red-600" }
      ]
    }

    const stats = equipment.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return [
      { label: "Available", value: stats.available || 0, color: "text-green-600" },
      { label: "In Use", value: stats["in-use"] || 0, color: "text-blue-600" },
      { label: "Maintenance", value: stats.maintenance || 0, color: "text-yellow-600" },
      { label: "Broken", value: stats.broken || 0, color: "text-red-600" }
    ]
  }

  if (loading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      </LayoutShell>
    )
  }

  return (
    <LayoutShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Equipment Management
            </h1>
            <p className="text-muted-foreground">Monitor and manage classroom equipment</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                onClick={() => {
                  setEditingItem(null)
                  setFormData({
                    name: "",
                    type: "",
                    model: "",
                    serialNumber: "",
                    status: "available",
                    location: "",
                    assignedTo: "",
                    notes: ""
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update equipment details' : 'Add new equipment to the system'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Equipment Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Dell Projector XPS"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Projector">Projector</SelectItem>
                        <SelectItem value="Laptop">Laptop</SelectItem>
                        <SelectItem value="Speaker">Speaker</SelectItem>
                        <SelectItem value="Camera">Camera</SelectItem>
                        <SelectItem value="Router">Router</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: Equipment["status"]) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="broken">Broken</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Room A1"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="Enter equipment model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      placeholder="Enter serial number"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      placeholder="Enter person/department"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Additional notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {getStatusStats().map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                      stat.label === 'Available' ? 'from-green-100 to-green-200' :
                      stat.label === 'In Use' ? 'from-blue-100 to-blue-200' :
                      stat.label === 'Maintenance' ? 'from-yellow-100 to-yellow-200' :
                      'from-red-100 to-red-200'
                    } flex items-center justify-center`}>
                      <Settings className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Equipment Table */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Inventory</CardTitle>
            <CardDescription>Complete list of all equipment items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map((item) => {
                    const IconComponent = equipmentIcons[item.type as keyof typeof equipmentIcons] || Settings
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-100 to-blue-100 flex items-center justify-center">
                              <IconComponent className="h-4 w-4 text-teal-600" />
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusColors[item.status]}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.location || 'N/A'}</TableCell>
                        <TableCell>{item.model || 'N/A'}</TableCell>
                        <TableCell>{item.assignedTo || 'Unassigned'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {equipment.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No equipment found. Add some equipment to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  )
}
