#pragma once
#include "Dialog.h"
#include "GirdLayout.h"
#include "Label.h"
#include "Button.h"

namespace AssortedWidgets
{
	namespace Test
	{
		class LabelNButtonTestDialog:public Widgets::Dialog
		{
		private:
            Layout::GirdLayout *m_girdLayout;
            Widgets::Button *m_testButton;
            Widgets::Button *m_closeButton;
            Widgets::Label *m_testLabel;

		public:
			LabelNButtonTestDialog(void);
			void onClose(const Event::MouseEvent &e);
		public:
			~LabelNButtonTestDialog(void);
		};
	}
}
