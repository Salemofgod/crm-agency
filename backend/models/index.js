const User   = require('./User');
const Client = require('./Client');
const Sale   = require('./Sale');
const Task   = require('./Task');

Client.belongsTo(User,   { foreignKey: 'created_by', as: 'creator' });
Sale.belongsTo(Client,   { foreignKey: 'client_id',  as: 'client'  });
Sale.belongsTo(User,     { foreignKey: 'created_by', as: 'creator' });
Client.hasMany(Sale,     { foreignKey: 'client_id',  as: 'sales'   });
Task.belongsTo(Client,   { foreignKey: 'client_id',  as: 'client'  });
Task.belongsTo(Sale,     { foreignKey: 'sale_id',    as: 'sale'    });
Task.belongsTo(User,     { foreignKey: 'assigned_to',as: 'assignee'});
Task.belongsTo(User,     { foreignKey: 'created_by', as: 'creator' });

module.exports = { User, Client, Sale, Task };
