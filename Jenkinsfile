pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }
    stages {
        stage('build') {
            steps {
                ansiColor('xterm') {
                    script {
                        docker.withTool('docker') {
                            docker.withRegistry('https://docker.actano.de', 'docker.actano.de/user') {
                                def image = docker.build('actano/js-dsm')
                                image.push()
                            }
                        }
                    }
                }
            }
        }
    }
}
