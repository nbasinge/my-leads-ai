#!/bin/bash

# Setup Supabase SSM Parameters for Nescka Lead Tracker
# This script stores Supabase credentials in AWS Systems Manager Parameter Store

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Supabase SSM Parameter Setup for Nescka Lead Tracker  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Please install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI is configured${NC}"
echo ""

# Get current AWS region
AWS_REGION=$(aws configure get region || echo "us-east-1")
echo -e "${BLUE}Using AWS Region: ${AWS_REGION}${NC}"
echo ""

# Function to read secure input
read_secret() {
    local prompt="$1"
    echo -e "${YELLOW}${prompt}${NC}"
    read -s input
    echo ""
    echo "$input"
}

# Function to read regular input
read_input() {
    local prompt="$1"
    local default="$2"
    echo -e "${YELLOW}${prompt}${default:+ (default: ${default})}${NC}"
    read input
    echo "${input:-$default}"
}

# Get Supabase connection details
echo -e "${BLUE}📋 Enter your Supabase connection details:${NC}"
echo -e "${BLUE}   (Get these from: Supabase Dashboard → Settings → Database)${NC}"
echo ""

SUPABASE_HOST=$(read_input "Supabase Database Host (db.xxxxxxx.supabase.co):" "")
if [ -z "$SUPABASE_HOST" ]; then
    echo -e "${RED}❌ Host is required${NC}"
    exit 1
fi

SUPABASE_PORT=$(read_input "Port (5432 for direct, 6543 for pooler):" "5432")
SUPABASE_DATABASE=$(read_input "Database name:" "postgres")
SUPABASE_USER=$(read_input "User:" "postgres")
SUPABASE_PASSWORD=$(read_secret "Password (hidden): ")

if [ -z "$SUPABASE_PASSWORD" ]; then
    echo -e "${RED}❌ Password is required${NC}"
    exit 1
fi

echo ""

# Confirmation
echo -e "${BLUE}Review your settings:${NC}"
echo -e "  Host:     ${GREEN}${SUPABASE_HOST}${NC}"
echo -e "  Port:     ${GREEN}${SUPABASE_PORT}${NC}"
echo -e "  Database: ${GREEN}${SUPABASE_DATABASE}${NC}"
echo -e "  User:     ${GREEN}${SUPABASE_USER}${NC}"
echo -e "  Password: ${GREEN}****${NC}"
echo ""

read -p "$(echo -e ${YELLOW}Continue and create SSM parameters? [y/N]: ${NC})" confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}📦 Creating SSM parameters...${NC}"
echo ""

# Create parameters
SUPABASE_HOST_PARAM="/nescka/supabase/host"
SUPABASE_PORT_PARAM="/nescka/supabase/port"
SUPABASE_DATABASE_PARAM="/nescka/supabase/database"
SUPABASE_USER_PARAM="/nescka/supabase/user"
SUPABASE_PASSWORD_PARAM="/nescka/supabase/password"

# Function to create or update parameter
upsert_parameter() {
    local name="$1"
    local value="$2"
    local description="$3"
    local type="$4"
    
    if aws ssm get-parameter --name "$name" --region "$AWS_REGION" &> /dev/null; then
        echo -e "  Updating: ${name}"
        aws ssm put-parameter \
            --name "$name" \
            --value "$value" \
            --description "$description" \
            --type "$type" \
            --region "$AWS_REGION" \
            --overwrite > /dev/null
    else
        echo -e "  Creating: ${name}"
        aws ssm put-parameter \
            --name "$name" \
            --value "$value" \
            --description "$description" \
            --type "$type" \
            --region "$AWS_REGION" > /dev/null
    fi
}

# Create/update parameters
upsert_parameter "$SUPABASE_HOST_PARAM" "$SUPABASE_HOST" "Supabase database host" "String"
upsert_parameter "$SUPABASE_PORT_PARAM" "$SUPABASE_PORT" "Supabase database port" "String"
upsert_parameter "$SUPABASE_DATABASE_PARAM" "$SUPABASE_DATABASE" "Supabase database name" "String"
upsert_parameter "$SUPABASE_USER_PARAM" "$SUPABASE_USER" "Supabase database user" "String"
upsert_parameter "$SUPABASE_PASSWORD_PARAM" "$SUPABASE_PASSWORD" "Supabase database password" "SecureString"

echo ""
echo -e "${GREEN}✅ All SSM parameters created successfully!${NC}"
echo ""

# Test retrieval
echo -e "${BLUE}🧪 Testing parameter retrieval...${NC}"
RETRIEVED_HOST=$(aws ssm get-parameter --name "$SUPABASE_HOST_PARAM" --region "$AWS_REGION" --query 'Parameter.Value' --output text 2>/dev/null || echo "")

if [ "$RETRIEVED_HOST" = "$SUPABASE_HOST" ]; then
    echo -e "${GREEN}✓ Parameters are accessible${NC}"
else
    echo -e "${RED}✗ Could not retrieve parameter${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Run: ${GREEN}cdk deploy NesckaN8nStack${NC}"
echo -e "  2. Wait for Fargate service to start"
echo -e "  3. Access n8n at: http://YOUR-ALB-DNS"
echo ""

echo -e "${BLUE}💡 Tip: You can view parameters in AWS Console:${NC}"
echo -e "   https://console.aws.amazon.com/systems-manager/parameters/?region=${AWS_REGION}"
echo ""

echo -e "${GREEN}All done! 🎉${NC}"

