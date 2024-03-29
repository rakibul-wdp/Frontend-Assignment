import ElementRenderer from "./ElementRenderer";
import Input from "./elements/Input";
import Radio from "./elements/Radio";
import ListInput from "./elements/Select";
import Switch from "./elements/Switch";
import Toggle from "./elements/Toggle";

export const uiComponents = {
  Input: {
    element: (rest, { finalValues, setFinalValues, showElement }) => {
      const { uiType, groupKey, isIgnore, ..._rest } = rest;

      return (
        <Input
          {..._rest}
          onChange={(e) => {
            if (rest.groupKey)
              setFinalValues?.({
                ...finalValues,
                [rest.groupKey]: {
                  ...finalValues[rest.groupKey],
                  [rest.jsonKey]: e.target.value,
                },
              });
            else
              setFinalValues?.({
                ...finalValues,
                [rest.jsonKey]: e.target.value,
              });
          }}
          disabled={rest.disable}
          hide={
            !rest.isIgnore &&
            !rest.validate.required &&
            !showElement &&
            !rest.isGroup
          }
        />
      );
    },
  },

  Select: {
    element: (rest, { finalValues, setFinalValues, showElement }) => {
      const { uiType, groupKey, isIgnore, ..._rest } = rest;

      return (
        <ListInput
          {..._rest}
          name={rest.jsonKey}
          options={rest.validate.options}
          onChange={(e) => {
            if (rest.groupKey)
              setFinalValues?.({
                ...finalValues,
                [rest.groupKey]: {
                  ...finalValues[rest.groupKey],
                  [rest.jsonKey]: e.value,
                },
              });
            else
              setFinalValues?.({
                ...finalValues,
                [rest.jsonKey]: e.value,
              });
          }}
          hide={
            !rest.isIgnore &&
            !rest.validate.required &&
            !showElement &&
            !rest.isGroup
          }
        />
      );
    },
  },

  Radio: {
    element: (
      rest,
      { conditions, setConditions, finalValues, setFinalValues, showElement }
    ) => {
      const { uiType, groupKey, isIgnore, ..._rest } = rest;

      return (
        <Radio
          {..._rest}
          name={rest.jsonKey}
          options={rest.validate.options}
          initilize={() =>
            setConditions?.({
              ...conditions,
              [`${rest.label.split(" ")[0].toLowerCase()}.${rest.jsonKey}`]:
                rest.validate.defaultValue,
            })
          }
          onChange={(e) => {
            setConditions?.({
              ...conditions,
              [`${rest.label.split(" ")[0].toLowerCase()}.${rest.jsonKey}`]: e,
            });

            let _finalValues = finalValues;
            delete _finalValues[rest.groupKey];
            setFinalValues?.(_finalValues);

            if (rest.groupKey)
              setFinalValues?.({
                ...finalValues,
                [rest.groupKey]: {
                  ...finalValues[rest.groupKey],
                  [rest.jsonKey]: e,
                },
              });
            else
              setFinalValues?.({
                ...finalValues,
                [rest.jsonKey]: e,
              });
          }}
          hide={
            !rest.isIgnore &&
            !rest.validate.required &&
            !showElement &&
            !rest.isGroup
          }
        />
      );
    },
  },

  Switch: {
    element: (rest, { finalValues, setFinalValues, showElement }) => {
      const { uiType, groupKey, isIgnore, ..._rest } = rest;

      const defaultValue = rest.validate.defaultValue;

      const checked =
        typeof defaultValue === "boolean"
          ? defaultValue
          : typeof defaultValue === "string" && defaultValue === "true";

      return (
        <Switch
          {..._rest}
          name={rest.jsonKey}
          defaultChecked={checked}
          onChange={(e) => {
            if (rest.groupKey)
              setFinalValues?.({
                ...finalValues,
                [rest.groupKey]: {
                  ...finalValues[rest.groupKey],
                  [rest.jsonKey]: e,
                },
              });
            else
              setFinalValues?.({
                ...finalValues,
                [rest.jsonKey]: e,
              });
          }}
          hide={
            !rest.isIgnore &&
            !rest.validate.required &&
            !showElement &&
            !rest.isGroup
          }
        />
      );
    },
  },

  Group: {
    element: (rest, { conditions, setConditions }) => {
      const requiredComponent = rest.subParameters.filter(
        (comp) => comp.validate.required
      );
      const notRequiredComponent = rest.subParameters.filter(
        (comp) => !comp.validate.required && !comp.disable
      );

      const RenderGroupElements = (subComp, key) => (
        <div key={key + "main-group"}>
          <ElementRenderer
            groupKey={rest.jsonKey}
            {...subComp}
            isGroup={true}
          />

          {subComp.uiType !== "Ignore" &&
            subComp.subParameters?.map((subComp2, index) => (
              <ElementRenderer
                key={subComp2.jsonKey + index + "sub-group"}
                groupKey={rest.jsonKey}
                {...subComp2}
              />
            ))}
        </div>
      );

      const isToggled = conditions[`${rest.jsonKey}-toggle`];

      return (
        <div className="card grid gap-4">
          <h3 className="font-semibold">{rest.label.replaceAll("_", " ")}</h3>

          <hr className="border" />

          {requiredComponent.map((subComp, index) =>
            RenderGroupElements(
              subComp,
              subComp.jsonKey + index + "required-group"
            )
          )}

          {isToggled && (
            <div>
              {notRequiredComponent.map((subComp, index) =>
                RenderGroupElements(
                  subComp,
                  subComp.jsonKey + index + "not-required-group"
                )
              )}
            </div>
          )}

          {notRequiredComponent.length !== 0 && (
            <Toggle
              label={
                !isToggled ? "Show advanced fields" : "Hide advanced fields"
              }
              name="HideToggle"
              checked={isToggled || false}
              onChange={(e) => {
                setConditions?.({
                  ...conditions,
                  [`${rest.jsonKey}-toggle`]: e,
                });
              }}
            />
          )}
        </div>
      );
    },
  },

  Ignore: {
    element: (rest, { conditions }) => {
      const groupKey = rest.conditions[0].jsonKey.split(".")[0];

      const value =
        rest.conditions[0].op === "=="
          ? conditions[rest.conditions[0].jsonKey] === rest.conditions[0].value
          : rest.conditions[0].op === ">"
          ? conditions[rest.conditions[0].jsonKey] > rest.conditions[0].value
          : conditions[rest.conditions[0].jsonKey] < rest.conditions[0].value;

      return (
        <>
          {rest.subParameters?.map((subComp2, index) =>
            value ? (
              <ElementRenderer
                {...subComp2}
                key={subComp2.jsonKey + index + "ignore"}
                groupKey={groupKey}
                isGroup={true}
                isIgnore={true}
              />
            ) : null
          )}
        </>
      );
    },
  },
};
