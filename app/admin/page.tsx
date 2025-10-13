'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { COLLECTOR_LEVELS, CATEGORIES } from '@/lib/constants'
import { Plus, CreditCard as Edit, Trash2, Upload, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [accountForm, setAccountForm] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    collector_level: '',
    images: [] as string[],
  })
  
  const [adForm, setAdForm] = useState({
    id: '',
    title: '',
    image_url: '',
    link: '',
    order_index: '',
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editingType, setEditingType] = useState<'account' | 'ad' | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [accountsResult, adsResult] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('ads').select('*').order('order_index')
      ])

      setAccounts(accountsResult.data || [])
      setAds(adsResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const accountData = {
        title: accountForm.title,
        description: accountForm.description,
        price: parseFloat(accountForm.price),
        discount: accountForm.discount ? parseFloat(accountForm.discount) : null,
        category: accountForm.category,
        collector_level: accountForm.collector_level || null,
        images: accountForm.images,
      }

      if (isEditing && accountForm.id) {
        const { error } = await supabase
          .from('accounts')
          .update(accountData)
          .eq('id', accountForm.id)
        
        if (error) throw error
        toast.success('Account updated successfully')
      } else {
        const { error } = await supabase
          .from('accounts')
          .insert(accountData)
        
        if (error) throw error
        toast.success('Account created successfully')
      }

      resetAccountForm()
      fetchData()
    } catch (error) {
      console.error('Error saving account:', error)
      toast.error('Error saving account')
    } finally {
      setLoading(false)
    }
  }

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const adData = {
        title: adForm.title,
        image_url: adForm.image_url,
        link: adForm.link || null,
        order_index: parseInt(adForm.order_index),
        is_active: true,
      }

      if (isEditing && adForm.id) {
        const { error } = await supabase
          .from('ads')
          .update(adData)
          .eq('id', adForm.id)
        
        if (error) throw error
        toast.success('Ad updated successfully')
      } else {
        const { error } = await supabase
          .from('ads')
          .insert(adData)
        
        if (error) throw error
        toast.success('Ad created successfully')
      }

      resetAdForm()
      fetchData()
    } catch (error) {
      console.error('Error saving ad:', error)
      toast.error('Error saving ad')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ 
          is_sold: true,
          sold_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      toast.success('Account marked as sold')
      fetchData()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Error marking account as sold')
    }
  }

  const handleDeleteAd = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Ad deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting ad:', error)
      toast.error('Error deleting ad')
    }
  }

  const editAccount = (account: any) => {
    setAccountForm({
      id: account.id,
      title: account.title,
      description: account.description,
      price: account.price.toString(),
      discount: account.discount?.toString() || '',
      category: account.category,
      collector_level: account.collector_level || '',
      images: account.images,
    })
    setIsEditing(true)
    setEditingType('account')
  }

  const editAd = (ad: any) => {
    setAdForm({
      id: ad.id,
      title: ad.title || '',
      image_url: ad.image_url,
      link: ad.link || '',
      order_index: ad.order_index.toString(),
    })
    setIsEditing(true)
    setEditingType('ad')
  }

  const resetAccountForm = () => {
    setAccountForm({
      id: '',
      title: '',
      description: '',
      price: '',
      discount: '',
      category: '',
      collector_level: '',
      images: [],
    })
    setIsEditing(false)
    setEditingType(null)
  }

  const resetAdForm = () => {
    setAdForm({
      id: '',
      title: '',
      image_url: '',
      link: '',
      order_index: '',
    })
    setIsEditing(false)
    setEditingType(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload to Supabase Storage
      const mockUrl = `https://picsum.photos/800/600?random=${Date.now()}`
      
      if (typeof index === 'number') {
        const newImages = [...accountForm.images]
        newImages[index] = mockUrl
        setAccountForm(prev => ({ ...prev, images: newImages }))
      } else {
        setAccountForm(prev => ({ 
          ...prev, 
          images: [...prev.images, mockUrl]
        }))
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Accounts Management */}
          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing && editingType === 'account' ? 'Edit Account' : 'Create New Account'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={accountForm.title}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={accountForm.category} 
                        onValueChange={(value) => setAccountForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile_legend">Mobile Legend</SelectItem>
                          <SelectItem value="pubg">PUBG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={accountForm.description}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={accountForm.price}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        max="100"
                        value={accountForm.discount}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, discount: e.target.value }))}
                      />
                    </div>

                    {accountForm.category === 'mobile_legend' && (
                      <div>
                        <Label htmlFor="collector_level">Collector Level</Label>
                        <Select 
                          value={accountForm.collector_level} 
                          onValueChange={(value) => setAccountForm(prev => ({ ...prev, collector_level: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLLECTOR_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Images (Up to 5)</Label>
                    <div className="space-y-2">
                      {Array.from({ length: 5 }, (_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, index)}
                            className="flex-1"
                          />
                          {accountForm.images[index] && (
                            <Badge variant="outline">Image {index + 1}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update' : 'Create'}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={resetAccountForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Accounts List */}
            <Card>
              <CardHeader>
                <CardTitle>Accounts List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{account.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {CATEGORIES[account.category as keyof typeof CATEGORIES]} • ${account.price}
                          {account.discount && ` (-${account.discount}%)`}
                        </p>
                        {account.is_sold && (
                          <Badge variant="destructive" className="mt-1">Sold Out</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editAccount(account)}
                          disabled={account.is_sold}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                          disabled={account.is_sold}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Management */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing && editingType === 'ad' ? 'Edit Ad' : 'Create New Ad'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad-title">Title (Optional)</Label>
                      <Input
                        id="ad-title"
                        value={adForm.title}
                        onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="order">Order Index</Label>
                      <Input
                        id="order"
                        type="number"
                        value={adForm.order_index}
                        onChange={(e) => setAdForm(prev => ({ ...prev, order_index: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={adForm.image_url}
                      onChange={(e) => setAdForm(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="link">Link (Optional)</Label>
                    <Input
                      id="link"
                      value={adForm.link}
                      onChange={(e) => setAdForm(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update' : 'Create'}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={resetAdForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Ads List */}
            <Card>
              <CardHeader>
                <CardTitle>Ads List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{ad.title || 'Untitled Ad'}</h3>
                        <p className="text-sm text-muted-foreground">Order: {ad.order_index}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editAd(ad)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAd(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Management */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}