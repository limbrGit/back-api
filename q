[1mdiff --git a/src/services/sql.ts b/src/services/sql.ts[m
[1mindex 69be29f..e96d558 100644[m
[1m--- a/src/services/sql.ts[m
[1m+++ b/src/services/sql.ts[m
[36m@@ -44,7 +44,7 @@[m [mconst sendSqlRequest = async ([m
   try {[m
     if (pool) {[m
       const [res] = await pool.query(sql, parameters);[m
[31m-      Logger.info({ functionName: functionName(1), data: 'SQL POOL OK' }, req);[m
[32m+[m[32m      Logger.info({ functionName: functionName(1), data: 'SQL POOL OK', res: res }, req);[m
       return res;[m
     } else {[m
       const connection = await mysql2.createConnection({[m
[1mdiff --git a/src/services/userPlatforms.ts b/src/services/userPlatforms.ts[m
[1mindex 4e80556..fb07bdb 100644[m
[1m--- a/src/services/userPlatforms.ts[m
[1m+++ b/src/services/userPlatforms.ts[m
[36m@@ -75,7 +75,8 @@[m [mexport const getUserPlatformsFromUserSQL = async ([m
     sql,[m
     [user.email],[m
     pool[m
[31m-  );[m
[32m+[m[32m    );[m
[32m+[m[32m    Logger.info({ functionName: functionName(2), result: result }, req);[m
 [m
   return result;[m
 };[m
