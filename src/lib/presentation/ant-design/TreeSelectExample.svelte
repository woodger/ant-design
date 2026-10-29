<script lang="ts">
  import { TreeSelect, Form, FormItem, Button, createForm } from '$lib/components/ant-design';
  const data=[{value:'components',title:'Компоненты',children:[{value:'button',title:'Button'},{value:'input',title:'Input'},{value:'select',title:'Select'}]},{value:'docs',title:'Документация',children:[{value:'start',title:'Начало работы'}]}];
  const form=createForm<{topics:string[]}>({initialValues:{topics:['button']},rules:{topics:[{required:true,message:'Выберите разделы.'}]}});
  let result=$state('');
</script>
<div style="max-width:640px;min-width:0">
  <Form {form} onFinish={values=>{result=values.topics.join(', ');}}>
    <FormItem name="topics" label="Подписка на разделы"><TreeSelect treeData={data} value={form.values.topics} treeCheckable treeDefaultExpandAll showSearch={{treeNodeFilterProp:'title'}} allowClear placeholder="Выберите разделы" onChange={next=>form.setFieldValue('topics',next)} /></FormItem>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><Button type="primary" htmlType="submit">Сохранить разделы</Button><Button htmlType="reset">Сбросить разделы</Button></div>
  </Form>
  <output aria-label="Сохранённые разделы">{result}</output>
</div>
