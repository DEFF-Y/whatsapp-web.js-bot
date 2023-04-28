export async function loadDatabase (m, msg) {
    const isNumber = x => typeof x === "number" && !isNaN(x)
    const isBoolean = x => typeof x === "boolean" && Boolean(x)
    let user = global.db.users[msg.sender]
    if (typeof user !== "object") global.db.users[msg.sender] = {}
    if (user) {
        if (!isBoolean(user.registered)) user.registered = true 
        if (!isBoolean(user.banned)) user.banned = false
    } else {
        global.db.users[msg.sender] = {
            registered: true,
            banned: false,
        }
    }

    if (msg.isGroup) {
        let group = global.db.groups[m.to]
        if (typeof group !== "object") global.db.groups[m.to] = {}
        if (group) {
            if (!isBoolean(group.welcome)) group.welcome = false
            if (!isBoolean(group.antilink)) group.antilink = false
        } else {
            global.db.groups[m.to] = {
                welcome: false,
                antilink: false
            }
        }
    }
    let setting = global.db.setting
         if (setting) {
         if (!isBoolean(setting.self)) setting.self = false 
         } else {
         global.db.setting = {
         self: false
          }
         }
}

