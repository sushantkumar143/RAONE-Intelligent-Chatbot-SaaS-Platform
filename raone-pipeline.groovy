pipeline {
    agent any

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/sushantkumar143/RAONE-Intelligent-Chatbot-SaaS-Platform.git'
            }
        }

        stage('Inject Backend .env') {
            steps {
                withCredentials([file(credentialsId: 'raone-env-file', variable: 'ENV_FILE')]) {
                    sh '''
                    echo "Injecting backend .env..."
                    cp $ENV_FILE backend/.env
                    ls -la backend/
                    '''
                }
            }
        }

        stage('Inject Frontend .env (Optional)') {
            steps {
                withCredentials([file(credentialsId: 'raone-env-file-frontend', variable: 'ENV_FILE_FRONT')]) {
                    sh '''
                    echo "Injecting frontend .env..."
                    cp $ENV_FILE_FRONT frontend/.env || true
                    ls -la frontend/
                    '''
                }
            }
        }

        stage('Debug Paths') {
            steps {
                sh '''
                echo "Checking backend env:"
                ls -la backend/

                echo "Checking frontend env:"
                ls -la frontend/
                '''
            }
        }

        stage('Docker Cleanup') {
            steps {
                sh 'docker compose down --remove-orphans || true'
            }
        }

        stage('Build & Deploy') {
            steps {
                sh 'docker compose up --build -d --force-recreate'
            }
        }

        stage('Verify Backend Env') {
            steps {
                sh 'docker compose exec backend printenv | grep -i KEY || true'
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }
}