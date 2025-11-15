import { executeCode } from "./execute";
import { ActionConfig, ConditionTypes, EventConfig } from "./types";

function executeConditions(conditions: ConditionTypes[], data: Record<string, any>): boolean {
  for (let i = 0; i < conditions.length; i++) {
    const { type, expression, functionName = "", api = "" } = conditions[i];
    if (type === "expression" && executeCode(expression, data) === false) {
      return false;
    } else if (type === "function" && data.globalFun[functionName] === false) {
      return false;
    } else if (type === "api" && data.apiResults[api] === false) {
      return false;
    }
  }
  return true;
}

function executeActions(actions: ActionConfig[], data: Record<string, any>) {
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const { type, params = {}, conditions = [] } = action;

    const checked = executeConditions(conditions, data);
    if (!checked) return;

    if (type == "execute_code") {
      executeCode(params.code, data);
    }
  }
}

/**
 * 执行事件动作
 * @param event 事件配置
 * @param data 数据源
 * @returns
 */
export function executeEventActive(event: EventConfig | undefined, data: Record<string, any>) {
  if (!event) return;
  const { actions, conditions = [] } = event;
  const checked = executeConditions(conditions, data);
  if (!checked) return;

  executeActions(actions, data);
}
