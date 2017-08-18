function Session(address, port)
{
    this.address = address;
    this.port = port;
    this.id = '';
    for(;this.id.length < 10;) this.id += Math.random().toString(36).substr(2, 1)
}
module.exports = Session;