pipeline {
  stages {
    stage('checkout') {
      steps {
        checkout scm
        sh 'git clean -d -f -x'
      }
    }
    stage('test') {
      agent { docker 'node:boron' }
      steps {
        sh 'npm test'
      }
    }
  }
}
