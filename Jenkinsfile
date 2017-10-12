pipeline {
  agent { docker 'node:boron' }
  stages {
    stage('checkout') {
      steps {
        checkout scm
        sh 'git clean -d -f -x'
      }
    }
    stage('test') {
      steps {
        sh 'npm test'
      }
    }
  }
}
