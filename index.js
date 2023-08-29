require('dotenv').config();
const { toGraphQLTypeDefs } = require("@neo4j/introspector");
const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
const { ApolloServer } = require("apollo-server");
const fs = require('fs');

// Config DB
const driver = neo4j.driver(
    process.env.DB_HOST,
    neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASS)
);

const sessionFactory = () => driver.session({ defaultAccessMode: neo4j.session.READ , database: process.env.DB_NAME});

async function main() {
    const readonly = true;
    const typeDefs = await toGraphQLTypeDefs(sessionFactory, readonly);
    
    console.log('Initiate Neoschema');
    const neoSchema = new Neo4jGraphQL({
        typeDefs, // Your generated typeDefs
        driver,
    });
    
    console.log('Initiate Server');
    const server = new ApolloServer({
        schema: await neoSchema.getSchema(),
    });

    server.listen(process.env.PORT).then(({ url }) => {
        console.log(`Server ready at ${url}`);
    });
}
main();
