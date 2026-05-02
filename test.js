const x = new Map()

const y = new Map()

x.set(10, y.set("ABC", "DATA->ABC"))
x.set(20, y.set("CDE", "DATA->CDE"))
x.set(30, y.set("FGH", "DATA->FGH"))

const allItemsInKey = x.get(20)


x.set((x.size + 1) * 10, allItemsInKey)
x.delete(20)

console.log(x)

