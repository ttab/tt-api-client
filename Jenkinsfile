pipeline {
  agent { docker 'node:boron' }
  stages {
    stage('checkout') {
      checkout scm
      sh 'git clean -d -f -x'
    }
    stage('test') {
      sh 'npm test'
    }
  }
}
