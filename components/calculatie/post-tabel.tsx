// components/calculatie/post-tabel.tsx
import { useState } from "react"
import { Edit2, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Post {
  id: string
  code: string
  omschrijving: string
  eenheid: string
  aantal: number
  eenheidsprijs: number
  arbeidsuren: number
  materiaal: number
  opmerking: string
  categorie?: string
}

interface PostTabelProps {
  posten: Post[]
  onUpdatePosten: (posten: Post[]) => void
  gemiddeldUurloon: number
}

export function PostTabel({ posten, onUpdatePosten, gemiddeldUurloon }: PostTabelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Post>>({})

  const berekenPostTotaal = (post: Post): number => {
    const arbeidskosten = post.arbeidsuren * gemiddeldUurloon
    const materiaal = post.materiaal || (post.eenheidsprijs * post.aantal)
    return arbeidskosten + materiaal
  }

  const startEdit = (post: Post) => {
    setEditingId(post.id)
    setEditData({ ...post })
  }

  const saveEdit = () => {
    if (editingId && editData) {
      const updated = posten.map(p => 
        p.id === editingId ? { ...p, ...editData } : p
      )
      onUpdatePosten(updated)
      setEditingId(null)
      setEditData({})
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const removePost = (id: string) => {
    const updated = posten.filter(p => p.id !== id)
    onUpdatePosten(updated)
  }

  const addNewPost = () => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      code: "",
      omschrijving: "Nieuwe werkzaamheid",
      eenheid: "m²",
      aantal: 1,
      eenheidsprijs: 0,
      arbeidsuren: 0,
      materiaal: 0,
      opmerking: "",
      categorie: "algemeen"
    }
    onUpdatePosten([...posten, newPost])
    setEditingId(newPost.id)
    setEditData({ ...newPost })
  }

  const totaal = posten.reduce((sum, post) => sum + berekenPostTotaal(post), 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Werkzaamheden ({posten.length})</h3>
          <p className="text-sm text-gray-500">Totaal: €{totaal.toFixed(2)}</p>
        </div>
        <Button onClick={addNewPost} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Post toevoegen
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Omschrijving</TableHead>
              <TableHead className="w-[100px]">Eenheid</TableHead>
              <TableHead className="w-[100px]">Aantal</TableHead>
              <TableHead className="w-[120px]">Arbeid (uren)</TableHead>
              <TableHead className="w-[120px]">Materiaal</TableHead>
              <TableHead className="w-[120px]">Totaal</TableHead>
              <TableHead className="w-[80px]">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posten.map((post) => {
              const isEditing = editingId === post.id
              const data = isEditing ? editData : post

              return (
                <TableRow key={post.id} className={isEditing ? "bg-blue-50" : ""}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={data.code || ""}
                        onChange={(e) => setEditData({...data, code: e.target.value})}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <span className="font-mono text-sm">{post.code}</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={data.omschrijving || ""}
                        onChange={(e) => setEditData({...data, omschrijving: e.target.value})}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <div>
                        <div className="font-medium">{post.omschrijving}</div>
                        {post.opmerking && (
                          <div className="text-xs text-gray-500">{post.opmerking}</div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <select
                        value={data.eenheid || ""}
                        onChange={(e) => setEditData({...data, eenheid: e.target.value})}
                        className="w-full h-8 px-2 text-sm border rounded"
                      >
                        <option value="m²">m²</option>
                        <option value="m">m</option>
                        <option value="stuk">stuk</option>
                        <option value="uur">uur</option>
                      </select>
                    ) : (
                      post.eenheid
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={data.aantal || 0}
                        onChange={(e) => setEditData({...data, aantal: Number(e.target.value)})}
                        className="h-8 text-sm"
                      />
                    ) : (
                      post.aantal
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={data.arbeidsuren || 0}
                        onChange={(e) => setEditData({...data, arbeidsuren: Number(e.target.value)})}
                        className="h-8 text-sm"
                      />
                    ) : (
                      `${post.arbeidsuren} uur`
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={data.materiaal || 0}
                        onChange={(e) => setEditData({...data, materiaal: Number(e.target.value)})}
                        className="h-8 text-sm"
                      />
                    ) : (
                      `€${(post.materiaal || post.eenheidsprijs * post.aantal).toFixed(2)}`
                    )}
                  </TableCell>
                  
                  <TableCell className="font-semibold">
                    €{berekenPostTotaal(post).toFixed(2)}
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          className="h-7 w-7 p-0"
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-7 w-7 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(post)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePost(post.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
