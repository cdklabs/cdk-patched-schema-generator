# CDK Patched Schema Generator

A GitHub Action that generates AWS CDK-compatible schema files for CloudFormation resources and property types.

## Usage

Add this action to your workflow:

```yaml
- uses: cdklabs/cdk-patched-schema-generator@main
  with:
    output-path: ./schemas
```

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `output-path` | Directory to save generated schema files | Yes | - |

### Outputs

Generates two files in the specified directory:
- `cdk-resources.json` - CloudFormation resource schemas
- `cdk-types.json` - CloudFormation property type schemas

## Example Workflow

```yaml
name: Generate CDK Schema
on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cdklabs/cdk-patched-schema-generator@main
        with:
          output-path: ./cdk-schemas
      - name: Commit files
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add cdk-schemas/
          git diff --staged --quiet || git commit -m "Update CDK schemas"
          git push
```

## Development

```bash
npm install
npm run build
npm test
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

