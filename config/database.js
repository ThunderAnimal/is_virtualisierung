/**
 * Created by insanemac on 31/05/2017.
 */
module.exports = {
    //postgres://username:password@host:port/database
    "connectionURL": process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/is_viz'
};