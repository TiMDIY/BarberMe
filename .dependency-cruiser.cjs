/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-cannot-depend-on-infrastructure',
      comment: 'Clean Architecture Rule: The Core Domain (src/engine) cannot depend on HTTP/Express or DB infrastructure.',
      severity: 'error',
      from: {
        path: '^src/engine'
      },
      to: {
        path: '^src/server|^node_modules/(express|cors|supertest)'
      }
    },
    {
      name: 'services-cannot-depend-on-server-entrypoint',
      comment: 'Clean Architecture Rule: Use Case Services cannot depend on the HTTP Server Entrypoint.',
      severity: 'error',
      from: {
        path: '^src/services'
      },
      to: {
        path: '^src/server\\.ts'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+'
      }
    }
  }
};
