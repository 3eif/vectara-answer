import { ReactNode, useEffect, useRef } from "react";
import classNames from "classnames";
import { FocusOn } from "react-focus-on";
import { VuiFlexContainer } from "../flex/FlexContainer";
import { VuiFlexItem } from "../flex/FlexItem";
import { VuiButtonIcon } from "../button/ButtonIcon";
import { VuiIcon } from "../icon/Icon";
import { BiX } from "react-icons/bi";
import { VuiPortal } from "../portal/Portal";
import { VuiScreenBlock } from "../screenBlock/ScreenBlock";

const COLOR = ["primary", "danger"] as const;

type Props = {
  className?: string;
  title?: ReactNode;
  children?: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  color?: (typeof COLOR)[number];
};

export const VuiDrawer = ({ className, color = "primary", title, children, isOpen, onClose, ...rest }: Props) => {
  const returnFocusElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      returnFocusElRef.current = document.activeElement as HTMLElement;
    } else {
      returnFocusElRef.current?.focus();
      returnFocusElRef.current = null;
    }
  }, [isOpen]);

  const classes = classNames("vuiDrawer", `vuiDrawer--${color}`, className);

  return (
    <VuiPortal>
      {isOpen && (
        <VuiScreenBlock>
          <FocusOn onEscapeKey={onClose} onClickOutside={onClose} returnFocus={false}>
            <div className={classes} {...rest}>
              <div className="vuiDrawerHeader">
                <VuiFlexContainer justifyContent="spaceBetween" alignItems="center">
                  <VuiFlexItem grow={false}>{title}</VuiFlexItem>

                  {onClose && (
                    <VuiFlexItem>
                      <VuiButtonIcon
                        onClick={onClose}
                        color="normal"
                        icon={
                          <VuiIcon size="m" color="normal">
                            <BiX />
                          </VuiIcon>
                        }
                      />
                    </VuiFlexItem>
                  )}
                </VuiFlexContainer>
              </div>

              <div className="vuiDrawerContent">
                <div className="vuiDrawerContent__inner">{children}</div>
              </div>
            </div>
          </FocusOn>
        </VuiScreenBlock>
      )}
    </VuiPortal>
  );
};