// CI-only evidence rendering; never writes the source report or external services.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(process.env.EXPECTED_HEAD_SHA!==head)throw new Error('CI checkout is not the requested final PR HEAD');
execFileSync('git',['diff','--exit-code','HEAD','--'],{stdio:'pipe'});
if(process.argv[2]==='--node-summary'){
  const tap=fs.readFileSync(process.argv[3],'utf8'),count=key=>Number(tap.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]??NaN);
  const evidence={head,tests:count('tests'),pass:count('pass'),fail:count('fail'),skipped:count('skipped'),cancelled:count('cancelled')};
  if(!evidence.tests||evidence.pass!==evidence.tests||evidence.fail!==0||evidence.skipped!==0||evidence.cancelled!==0)throw new Error('Node suite is not completely passing without skips');
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`evidence=${JSON.stringify(evidence)}\n`);console.log(JSON.stringify(evidence));
}else{
  const evidence=JSON.parse(process.env.NODE_TEST_EVIDENCE||'null');
  if(evidence?.head!==head||evidence.pass!==evidence.tests||evidence.fail||evidence.skipped||process.env.BROWSER_QA!=='success'||process.env.DESIGN_QA!=='success')throw new Error('Final HEAD gates did not all pass');
  const folder='/tmp/ava-workspace-final';fs.mkdirSync(folder,{recursive:true});
  const run=`${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const report=fs.readFileSync('docs/workspace-registry-review.md','utf8').replaceAll('{{FINAL_PR_HEAD}}',head).replaceAll('{{FINAL_CI_RUN}}',run);
  fs.writeFileSync(path.join(folder,'workspace-registry-review.md'),report);
  fs.writeFileSync(path.join(folder,'workspace-final-evidence.json'),JSON.stringify({...evidence,browser:'success',designSystem:'success',run,physicalDevice:'NOT VERIFIED',productionMutation:false},null,2)+'\n');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Final PR HEAD evidence\n\nHEAD: \`${head}\`\n\nNode: ${evidence.pass}/${evidence.tests}, no skips. Workspace Chromium and canonical Design System: PASS. Physical iPad/PWA and production: NOT VERIFIED.\n`);
  console.log(`Verified final HEAD ${head}; Node ${evidence.pass}/${evidence.tests}; browser/design PASS; report rendered at ${folder}`);
}
