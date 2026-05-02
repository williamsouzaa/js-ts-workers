import { group } from 'console';
import util from 'util'
const memoriaAntes = process.memoryUsage().heapUsed;

const lista = [
  {
    eventId: "ID177768478015742122",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID17776847801573217",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID1777684732131801570",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID1777683211247801573",
    keyGroup: "efinanceira#12345678000199#003#2026#10"
  },
  {
    eventId: "ID1777683211247822201573",
    keyGroup: "efinanceira#12345678000199#003#2026#10"
  },
  {
    eventId: "ID177768321124782232201573",
    keyGroup: "efinanceira#12345678000199#003#2026#10"
  },
  {
    eventId: "ID17776847801321572",
    keyGroup: "efinanceira#12345678000199#003#2026#5"
  },
  {
    eventId: "ID177768473213123801576",
    keyGroup: "efinanceira#12345678000199#003#2026#5"
  },
  {
    eventId: "ID1777684780321311575",
    keyGroup: "efinanceira#12345678000199#003#2026#12"
  },
  {
    eventId: "ID17776847321321312801576",
    keyGroup: "efinanceira#12345678000199#003#2026#5"
  },
  {
    eventId: "ID177768321321347801577",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID17776843213127801577",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
    {
    eventId: "ID17776832132131247801577",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID1777684732131801577",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID177763213847801577",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID1777684783123101589",
    keyGroup: "efinanceira#12345678000199#003#2026#10"
  },
  {
    eventId: "ID17776321318478015816",
    keyGroup: "efinanceira#12345678000199#003#2026#6"
  },
  {
    eventId: "ID177768478015817",
    keyGroup: "efinanceira#12345678000199#003#2026#1"
  },
  {
    eventId: "ID177768478015818",
    keyGroup: "efinanceira#12345678000199#003#2026#9"
  },
  {
    eventId: "ID17776847801578",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID177768478015812",
    keyGroup: "efinanceira#12345678000199#003#2026#3"
  },
  {
    eventId: "ID177768478015815",
    keyGroup: "efinanceira#12345678000199#003#2026#10"
  }
]





const queue = new Map();
const LIMIT_PER_PACKAGE = 3;

function addItemQueue(keyGroup, eventId, data) {
  const currentTs = Date.now()

  if (!queue.has(keyGroup)) {
    const lastPackageId = 1
    const firstPackage = { lastEventCreatedAt: currentTs, events: new Map().set(eventId, data) }
    queue.set(keyGroup, { lastPackageId,  package: new Map().set(lastPackageId, firstPackage) });
    return { keyGroup, package: { lastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
  }

  const group = queue.get(keyGroup)
  const lastPackage = group.package.get(group.lastPackageId)

  if (lastPackage.events.size < LIMIT_PER_PACKAGE) {
    lastPackage.lastEventCreatedAt = currentTs
    lastPackage.events.set(eventId, data)
    return { keyGroup, package: { lastPackageId: group.lastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
  }

  const newLastPackageId = group.lastPackageId + 1
  group.lastPackageId = newLastPackageId
  group.package.set(newLastPackageId, { lastEventCreatedAt: currentTs, events: new Map().set(eventId, data) })
  return { keyGroup, package: { lastPackageId: newLastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
}


function deleteItemQueue(keyGroup, packageIndex, eventId) {
  if (!queue.has(keyGroup)) return
  const group = queue.get(keyGroup);
  const packageGroup = group.package.get(packageIndex);

  if (!packageGroup.events.has(eventId)) return

  packageGroup.events.delete(eventId)
  if (packageGroup.events.size == 0) {
    group.package.delete(packageIndex)
  }
}

function deletePackageQueue(keyGroup, packageIndex) {
  if (!queue.has(keyGroup)) return
  const group = queue.get(keyGroup);
  const packageGroup = group.package.get(packageIndex);

  if (!group.package.has(packageIndex)) return
  group.package.delete(packageIndex)

  if (group.package.size == 0) {
    queue.delete(keyGroup)
  }
}



for (const el of lista) {
  const eventId = el.eventId
  const keyGroup = el.keyGroup

  const r = addItemQueue(keyGroup, eventId, {"any": "json_str"})
}

deleteItemQueue("efinanceira#12345678000199#003#2026#3", 1, "ID177768478015742122")
deleteItemQueue("efinanceira#12345678000199#003#2026#3", 1, "ID17776847801573217")
deleteItemQueue("efinanceira#12345678000199#003#2026#3", 1, "ID1777684732131801570")
deleteItemQueue("efinanceira#12345678000199#003#2026#3", 2, "ID17776843213127801577")
deleteItemQueue("efinanceira#12345678000199#003#2026#3", 2, "ID17776832132131247801577")

addItemQueue("efinanceira#12345678000199#003#2026#3", "ID-NOVO-17776847801577", {"msg": "novo conteudo"})
addItemQueue("efinanceira#12345678000199#003#2026#3", "ID-NOVO-2-17776847801577", {"msg": "novo conteudo"})
addItemQueue("efinanceira#12345678000199#003#2026#3", "ID-NOVO-3-17776847801577", {"msg": "novo conteudo"})


deletePackageQueue("efinanceira#12345678000199#003#2026#1", 1)
deletePackageQueue("efinanceira#12345678000199#003#2026#10", 1)


console.log("=============================================================")
console.log("=============================================================")
console.log("=============================================================")
console.log(util.inspect(queue, {
    showHidden: false,
    depth: null,
    colors: true
}));