var dbConfig = {
    synchronize: false,
    migrations: ['migrations/*.js'],
    cli: {
        migrationsDir: 'migrations',
    },
};

switch (process.env.NODE_ENV) {
    case 'dev':
        Object.assign(dbConfig, {
            type: 'postgres',
            host: '202.51.74.48',
            port: 5432,
            username: 'postgres',
            password: 'AllStar202',
            database: 'dev_nest',
            entities: ['**/*.entity.js'],
        });
        break;
    case 'test':
        Object.assign(dbConfig, {
            type: 'postgres',
            host: '202.51.74.48',
            port: 5432,
            username: 'postgres',
            password: 'AllStar2021',
            database: 'test_nestjs',
            entities: ['**/*.entity.ts'],
            migrationsRun:true,
        });
        break;
    case 'prod':
        Object.assign(dbConfig,{
            type: 'postgres',
            url: process.env.DATABASE_URL,
            migrationsRun:true,
            entities: ['**/*.entity.js'],
            ssl:{
                rejectUnauthorized:false,
            }
        })
        break;
    default:
        throw new Error('Unknown environment.');
}

module.exports = dbConfig;