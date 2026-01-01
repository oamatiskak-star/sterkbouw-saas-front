import { useState } from "react"
import { Edit2, Trash2, Plus } from "lucide-react"

import Button from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PostItem {
  id: string
  code: string
  omschrijving: string
  eenheid: string
  aantal: number
  prijs: number
  totaal: number
}

export default function PostTabel() {
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: "1",
      code: "101",
      omschrijving: "Fundering storten",
      eenheid: "m³",
      aantal: 10,
      prijs: 250,
      totaal: 2500,
    },
    {
      id: "2",
      code: "102",
      omschrijving: "Betonnen vloer",
      eenheid: "m²",
      aantal: 50,
      prijs: 75,
      totaal: 3750,
    },
  ])

  const updatePost = (
    id: string,
    field: keyof PostItem,
    value: string | number
  ) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== id) return post

        const updated = { ...post, [field]: value } as PostItem

        if (field === "aantal" || field === "prijs") {
          updated.totaal =
            Number(updated.aantal) * Number(updated.prijs)
        }

        return updated
      })
    )
  }

  const addNewPost = () => {
    setPosts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        code: "",
        omschrijving: "",
        eenheid: "stuk",
        aantal: 1,
        prijs: 0,
        totaal: 0,
      },
    ])
  }

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const totaal = posts.reduce((sum, post) => sum + post.totaal, 0)

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <TableHeader className="">
            <TableRow className="">
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead className="">Omschrijving</TableHead>
              <TableHead className="w-[100px]">Eenheid</TableHead>
              <TableHead className="w-[100px]">Aantal</TableHead>
              <TableHead className="w-[100px]">Prijs</TableHead>
              <TableHead className="w-[100px]">Totaal</TableHead>
              <TableHead className="w-[80px]">Acties</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="">
            {posts.map((post) => (
              <TableRow key={post.id} className="">
                <TableCell className="">
                  <Input
                    value={post.code}
                    onChange={(e) =>
                      updatePost(post.id, "code", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell className="">
                  <Input
                    value={post.omschrijving}
                    onChange={(e) =>
                      updatePost(
                        post.id,
                        "omschrijving",
                        e.target.value
                      )
                    }
                  />
                </TableCell>

                <TableCell className="">
                  <Input
                    value={post.eenheid}
                    onChange={(e) =>
                      updatePost(post.id, "eenheid", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell className="">
                  <Input
                    type="number"
                    value={post.aantal}
                    onChange={(e) =>
                      updatePost(
                        post.id,
                        "aantal",
                        Number(e.target.value)
                      )
                    }
                  />
                </TableCell>

                <TableCell className="">
                  <Input
                    type="number"
                    value={post.prijs}
                    onChange={(e) =>
                      updatePost(
                        post.id,
                        "prijs",
                        Number(e.target.value)
                      )
                    }
                  />
                </TableCell>

                <TableCell className="font-medium">
                  €{post.totaal.toFixed(2)}
                </TableCell>

                <TableCell className="">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Totaal: €{totaal.toFixed(2)}
        </span>

        <Button size="sm" onClick={addNewPost} className="gap-2">
          <Plus className="h-4 w-4" />
          Post toevoegen
        </Button>
      </div>
    </div>
  )
}
